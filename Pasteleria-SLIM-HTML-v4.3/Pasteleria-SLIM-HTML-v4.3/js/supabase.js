// Capa de acceso a datos. Funciona en modo demostración si no hay credenciales.
(() => {
  const config = window.SUPABASE_CONFIG || { url: "", anonKey: "" };
  const ready = Boolean(config.url && config.anonKey && window.supabase?.createClient);
  const client = ready ? window.supabase.createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;

  window.SlimDB = {
    configured: ready,
    client,
    async signUp(email, password, profile) {
      if (!client) return null;
      return client.auth.signUp({ email, password, options: { data: profile } });
    },
    async signIn(email, password) {
      if (!client) return null;
      return client.auth.signInWithPassword({ email, password });
    },
    async signOut() {
      if (client) await client.auth.signOut();
    },
    async updateProfile(profile) {
      if (!client) return null;
      return client.auth.updateUser({ data: profile });
    },
    async saveOrder(order) {
      if (!client) return { mode: "local" };
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Inicia sesión con Supabase para sincronizar pedidos.");
      const { data: created, error } = await client.from("orders").insert({
        user_id: user.id,
        customer_email: user.email,
        delivery_type: order.delivery,
        store_id: order.delivery === "recojo" ? order.localId : null,
        delivery_address: order.delivery === "domicilio" ? order.data.address : null,
        district: order.delivery === "domicilio" ? order.data.district : null,
        reference: order.data.reference || null,
        recipient_name: order.data.fullname,
        phone: order.data.phone,
        scheduled_date: order.data.date,
        scheduled_slot: order.data.slot,
        payment_method: order.payment,
        subtotal: order.subtotal,
        shipping: order.shipping,
        discount: order.discount,
        total: order.total,
        status: "recibido"
      }).select("id, code").single();
      if (error) throw error;
      const rows = order.items.map(item => ({
        order_id: created.id,
        product_id: item.id,
        product_name: item.name,
        unit_price: item.price,
        quantity: item.qty
      }));
      const { error: itemsError } = await client.from("order_items").insert(rows);
      if (itemsError) {
        await client.from("orders").delete().eq("id", created.id);
        throw itemsError;
      }
      return created;
    },
    async saveClaim(claim) {
      if (!client) return null;
      const { data, error } = await client.rpc("submit_claim", { payload: claim });
      if (error) throw error;
      return data; // número correlativo generado por la base de datos
    },
    async getMyOrders() {
      if (!client) return [];
      const { data, error } = await client.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  };
})();
