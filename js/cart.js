// Carrito por cliente: cada cuenta (y el invitado) tiene el suyo en localStorage.
const SlimCart = (() => {
  const keyFor = (email) => `slim-cart-${email || "invitado"}`;
  const key = () => keyFor(SlimAuth.current()?.email);
  const empty = () => ({ items: [], coupon: false });

  function load(storageKey = key()) {
    try {
      const cart = JSON.parse(localStorage.getItem(storageKey));
      return cart && Array.isArray(cart.items) ? cart : empty();
    } catch {
      return empty();
    }
  }

  const save = (cart, storageKey = key()) =>
    localStorage.setItem(storageKey, JSON.stringify(cart));
  const count = () => load().items.reduce((sum, item) => sum + item.qty, 0);

  function add(product) {
    const cart = load();
    const found = cart.items.find((item) => item.id === product.id);
    if (found) found.qty++;
    else
      cart.items.push({
        id: product.id,
        name: product.name,
        size: "Estándar",
        price: product.price,
        qty: 1,
        img: product.img,
      });
    save(cart);
  }

  // Nueva compra terminada: el carrito vuelve a empezar vacío (y sin cupón).
  const clear = () => save(empty());

  // Lo que un invitado agregó pasa a su cuenta al iniciar sesión o registrarse.
  function adoptGuest(email) {
    const guestKey = keyFor();
    const guest = load(guestKey);
    if (!guest.items.length) return;
    const cart = load(keyFor(email));
    guest.items.forEach((item) => {
      const found = cart.items.find((i) => i.id === item.id);
      if (found) found.qty += item.qty;
      else cart.items.push(item);
    });
    save(cart, keyFor(email));
    localStorage.removeItem(guestKey);
  }

  function totals(cart, pickup = false) {
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = pickup || subtotal >= 300 || subtotal === 0 ? 0 : 80;
    const off = cart.coupon ? Math.round(subtotal * 0.1) : 0;
    return { subtotal, shipping, off, total: subtotal + shipping - off };
  }

  localStorage.removeItem("slim-cart-count");
  return { load, save, count, add, clear, adoptGuest, totals };
})();
