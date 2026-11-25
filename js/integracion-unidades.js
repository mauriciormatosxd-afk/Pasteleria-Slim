/* Integración práctica de Unidades 3 y 4 en la tienda y el panel. */
(() => {
  const enhance = () => {
    // Bootstrap: clases utilitarias y comportamiento de componentes en controles existentes.
    document.querySelectorAll('.btn,.add-button,.primary-btn').forEach(el => {
      el.classList.add('btn','btn-sm');
    });
    // Tailwind CSS: utilidades aplicadas a las tarjetas y agrupaciones reales.
    document.querySelectorAll('.section-heading,.panel-heading').forEach(el => el.classList.add('flex','items-center','gap-2'));
    document.querySelectorAll('.product-card,.category-card,.location-card,.stat-card').forEach(el => el.classList.add('rounded-xl','shadow-sm'));
    // Materialize CSS: Waves sobre botones, sin reemplazar formularios ni estilos propios.
    if (window.M && M.Waves) document.querySelectorAll('.btn, .add-button, .primary-btn, .icon-link').forEach(el => { if (!el.dataset.slimWaves) { M.Waves.attach(el, ['waves-effect','waves-light']); el.dataset.slimWaves='1'; } });
    // Animación de entrada progresiva y accesible.
    const candidates = document.querySelectorAll('.product-card,.category-card,.location-card,.value-card,.perk');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      }), {threshold:.08});
      candidates.forEach((el,i) => {if (!el.dataset.slimReveal) {el.classList.add('slim-reveal'); el.style.setProperty('--slim-delay', `${(i%4)*65}ms`); el.dataset.slimReveal='1'; observer.observe(el);}});
    } else candidates.forEach(el => {el.classList.add('is-visible'); el.dataset.slimReveal='1';});
    // Bootstrap tooltips si un elemento existente declara title.
    if (window.bootstrap?.Tooltip) document.querySelectorAll('[title]').forEach(el => new bootstrap.Tooltip(el));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance, {once:true}); else enhance();
  // Contenido insertado dinámicamente (productos, carrito y pedidos).
  const root = document.body;
  if (root && 'MutationObserver' in window) {
    let queued=false;
    new MutationObserver(() => { if(!queued){queued=true; requestAnimationFrame(()=>{queued=false;enhance();});} }).observe(root,{childList:true,subtree:true});
  }
})();
