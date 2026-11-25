(() => {
  const $ = (s) => document.querySelector(s);
  const money = (n) => `S/ ${Number(n || 0).toFixed(2)}`;
  const date = (v) => v ? new Date(`${v}T00:00:00`).toLocaleDateString('es-PE') : '—';
  const statusNames = {recibido:'Recibido',confirmado:'Confirmado',en_preparacion:'En preparación',listo:'Listo',en_camino:'En camino',entregado:'Entregado',cancelado:'Cancelado'};
  const statuses = Object.keys(statusNames);
  let db, orders = [], products = [], categories = [];
  const notify = (msg, ok=false) => { const el=$('#notice'); el.textContent=msg; el.className=`notice show${ok?' success':''}`; window.setTimeout(()=>el.classList.remove('show'),5000); };
  const fail = (err) => { console.error(err); notify(err?.message || 'Ocurrió un error al consultar Supabase.'); };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function showView(name) {
    document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));
    document.querySelectorAll('.nav-link').forEach(v=>v.classList.toggle('active',v.dataset.view===name));
    $('#page-title').textContent={overview:'Resumen general',orders:'Gestión de pedidos',products:'Catálogo de productos',customers:'Clientes registrados'}[name];
    $('#sidebar').classList.remove('open');
  }
  async function init() {
    if (!window.SlimDB?.configured) { $('#connection-state').textContent='Supabase sin configurar'; notify('Completa Project URL y anon/publishable key en js/config.js y ejecuta el SQL de supabase/admin-setup.sql.'); return; }
    db=window.SlimDB.client;
    const {data:{user},error:authError}=await db.auth.getUser();
    if(authError || !user){ location.replace('login.html?next=admin.html'); return; }
    const {data:profile,error}=await db.from('profiles').select('full_name,role').eq('id',user.id).single();
    if(error){ fail(error); return; }
    if(profile?.role!=='admin'){ document.querySelector('.main-area').innerHTML='<div style="max-width:600px;margin:12vh auto;background:white;padding:35px;border-radius:14px"><h1>Acceso restringido</h1><p>Tu cuenta no tiene permisos de administrador. Solicita al responsable que asigne el rol correspondiente en Supabase.</p><a href="index.html">Volver a la tienda</a></div>'; return; }
    const name=profile.full_name || user.email || 'Administrador';
    $('#admin-name').textContent=name; $('#welcome-name').textContent=name.split(' ')[0];
    $('#today-label').textContent=new Date().toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    $('#connection-state').textContent='Supabase conectado'; $('#connection-state').classList.add('online');
    await refreshAll();
  }
  async function refreshAll(){
    try { const results=await Promise.all([
      db.from('orders').select('*,order_items(*)').order('created_at',{ascending:false}),
      db.from('products').select('*').order('id'),
      db.from('categories').select('*').order('name'),
      db.from('profiles').select('id,full_name,phone,document_type,document_number,created_at').order('created_at',{ascending:false})
    ]);
      results.forEach(r=>{if(r.error) throw r.error;});
      [orders,products,categories]=results.slice(0,3).map(r=>r.data||[]);
      renderOverview(); renderOrders(); renderProducts(); renderCustomers(results[3].data||[]);
    } catch(e){fail(e);}
  }
  function renderOverview(){
    const valid=orders.filter(o=>o.status!=='cancelado');
    $('#stat-sales').textContent=money(valid.reduce((s,o)=>s+Number(o.total),0));
    $('#stat-orders').textContent=orders.length;
    $('#stat-pending').textContent=orders.filter(o=>['recibido','confirmado'].includes(o.status)).length;
    $('#stat-products').textContent=products.filter(p=>p.active).length;
    $('#pending-badge').textContent=orders.filter(o=>['recibido','confirmado'].includes(o.status)).length;
    $('#recent-orders').innerHTML=orders.slice(0,6).map(o=>`<tr><td><b>${esc(o.code)}</b></td><td>${esc(o.recipient_name)}</td><td>${date(o.scheduled_date)}</td><td>${money(o.total)}</td><td><span class="status ${o.status}">${statusNames[o.status]||esc(o.status)}</span></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Todavía no hay pedidos.</td></tr>';
  }
  function renderOrders(){
    const filter=$('#order-filter').value;
    const rows=orders.filter(o=>!filter||o.status===filter);
    $('#orders-table').innerHTML=rows.map(o=>`<tr><td><b>${esc(o.code)}</b><br><small>${esc(o.customer_email)}</small></td><td>${esc(o.recipient_name)}<br><small>${esc(o.phone)}</small></td><td>${o.delivery_type==='recojo'?'Recojo en tienda':'Envío a domicilio'}<br><small>${esc(o.district||o.store_id||'')}</small></td><td>${date(o.scheduled_date)}<br><small>${esc(o.scheduled_slot||'')}</small></td><td>${money(o.total)}</td><td><select class="status-select browser-default" data-order-status="${o.id}" aria-label="Estado del pedido ${esc(o.code)}">${statuses.map(s=>`<option value="${s}" ${s===o.status?'selected':''}>${statusNames[s]}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No hay pedidos para este filtro.</td></tr>';
  }
  function renderProducts(){
    $('#products-table').innerHTML=products.map(p=>`<tr><td><b>${esc(p.name)}</b><br><small>${esc(p.description||'')}</small></td><td>${esc(categories.find(c=>c.id===p.category_id)?.name||p.category_id||'—')}</td><td>${money(p.price)}</td><td><span class="status ${p.active?'entregado':'cancelado'}">${p.active?'Visible':'Oculto'}</span></td><td><button class="table-action" data-edit-product="${p.id}">Editar</button><button class="table-action" data-toggle-product="${p.id}">${p.active?'Ocultar':'Activar'}</button></td></tr>`).join('')||'<tr><td colspan="5" class="empty">No hay productos.</td></tr>';
    $('#product-category').innerHTML=categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  }
  function renderCustomers(rows){ $('#customers-table').innerHTML=rows.map(p=>`<tr><td>${esc(p.full_name||'Sin nombre')}</td><td>${esc(p.phone||'—')}</td><td>${esc([p.document_type,p.document_number].filter(Boolean).join(' ')||'—')}</td><td>${new Date(p.created_at).toLocaleDateString('es-PE')}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">No hay clientes registrados.</td></tr>'; }
  async function updateStatus(id,status){try{const {error}=await db.from('orders').update({status}).eq('id',id);if(error)throw error;notify('Estado del pedido actualizado.',true);await refreshAll();}catch(e){fail(e);}}
  function openProduct(p){$('#product-dialog-title').textContent=p?'Editar producto':'Nuevo producto';$('#product-id').value=p?.id??'';$('#product-name').value=p?.name||'';$('#product-price').value=p?.price??'';$('#product-category').value=p?.category_id||categories[0]?.id||'';$('#product-image').value=p?.image||'';$('#product-description').value=p?.description||'';$('#product-active').checked=p?.active??true;$('#product-dialog').showModal();}
  async function saveProduct(ev){ev.preventDefault();const id=$('#product-id').value;const row={name:$('#product-name').value.trim(),price:Number($('#product-price').value),category_id:$('#product-category').value,image:$('#product-image').value.trim()||null,description:$('#product-description').value.trim()||null,active:$('#product-active').checked};try{let q;if(id)q=db.from('products').update(row).eq('id',Number(id));else{const nextId=Math.max(0,...products.map(p=>Number(p.id)))+1;q=db.from('products').insert({...row,id:nextId});}const {error}=await q;if(error)throw error;$('#product-dialog').close();notify('Producto guardado correctamente.',true);await refreshAll();}catch(e){fail(e);}}
  async function toggleProduct(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;try{const {error}=await db.from('products').update({active:!p.active}).eq('id',p.id);if(error)throw error;notify('Disponibilidad actualizada.',true);await refreshAll();}catch(e){fail(e);}}
  document.querySelectorAll('.nav-link').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
  document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.goto)));
  $('#order-filter').addEventListener('change',renderOrders); $('#refresh-btn').addEventListener('click',refreshAll);
  $('#menu-toggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  $('#new-product').addEventListener('click',()=>openProduct()); $('#close-dialog').addEventListener('click',()=>$('#product-dialog').close()); $('#cancel-dialog').addEventListener('click',()=>$('#product-dialog').close()); $('#product-form').addEventListener('submit',saveProduct);
  document.addEventListener('change',e=>{if(e.target.matches('[data-order-status]'))updateStatus(e.target.dataset.orderStatus,e.target.value);});
  document.addEventListener('click',e=>{const edit=e.target.closest('[data-edit-product]');const toggle=e.target.closest('[data-toggle-product]');if(edit)openProduct(products.find(p=>String(p.id)===edit.dataset.editProduct));if(toggle)toggleProduct(toggle.dataset.toggleProduct);});
  $('#logout-btn').addEventListener('click',async()=>{await window.SlimDB.signOut();location.href='login.html';});
  init().catch(fail);
})();
