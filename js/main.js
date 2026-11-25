let PRODUCTS = [
  {
    id: 1,
    name: "Torta de Chocolate Belga",
    price: 420,
    rating: 4.9,
    reviews: 128,
    badge: "Más vendido",
    cat: "tortas",
    img: "cake-chocolate.webp",
  },
  {
    id: 2,
    name: "Pastel de Fresas con Crema",
    price: 380,
    rating: 4.8,
    reviews: 95,
    badge: "Nuevo",
    cat: "pasteles",
    img: "cake-strawberry.webp",
  },
  {
    id: 3,
    name: "Cupcakes Red Velvet (x6)",
    price: 210,
    rating: 4.7,
    reviews: 212,
    badge: "",
    cat: "cupcakes",
    img: "cupcakes.webp",
  },
  {
    id: 4,
    name: "Tarta de Limón Merengue",
    price: 360,
    rating: 4.9,
    reviews: 74,
    badge: "Oferta",
    cat: "tartas",
    img: "lemon-tart.webp",
  },
  {
    id: 5,
    name: "Macarons Surtidos (x12)",
    price: 280,
    rating: 4.6,
    reviews: 156,
    badge: "",
    cat: "macarons",
    img: "macarons.webp",
  },
  {
    id: 6,
    name: "Galletas Decoradas (x10)",
    price: 150,
    rating: 4.5,
    reviews: 89,
    badge: "",
    cat: "galletas",
    img: "cookies.webp",
  },
  {
    id: 7,
    name: "Torta Selva Negra",
    price: 480,
    rating: 4.9,
    reviews: 63,
    badge: "Premium",
    cat: "tortas",
    img: "black-forest.webp",
  },
  {
    id: 8,
    name: "Pastel de Zanahoria",
    price: 320,
    rating: 4.7,
    reviews: 142,
    badge: "",
    cat: "pasteles",
    img: "carrot-cake.webp",
  },
  {
    id: 9,
    name: "Cheesecake de Frutos Rojos",
    price: 350,
    rating: 4.8,
    reviews: 110,
    badge: "Especial",
    cat: "especiales",
    img: "cheesecake.webp",
  },
  {
    id: 10,
    name: "Brownie con Nuez (x8)",
    price: 180,
    rating: 4.6,
    reviews: 201,
    badge: "",
    cat: "galletas",
    img: "brownies.webp",
  },
  {
    id: 11,
    name: "Pastel de Tres Leches",
    price: 340,
    rating: 4.9,
    reviews: 187,
    badge: "Clásico",
    cat: "pasteles",
    img: "tres-leches.webp",
  },
  {
    id: 12,
    name: "Caja de Cupcakes Mixtos (x12)",
    price: 380,
    rating: 4.7,
    reviews: 93,
    badge: "",
    cat: "cupcakes",
    img: "cupcakes-mix.webp",
  },
];
const FILES = {
  home: "index.html",
  products: "productos.html",
  search: "buscar.html",
  about: "nosotros.html",
  service: "servicio-cliente.html",
  cart: "carrito.html",
  user: "usuario.html",
  local: "locales.html",
  checkout: "checkout.html",
  login: "login.html",
};
const money = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

function icon(name) {
  const paths = {
    cart: '<path d="M3 3h2l2.2 9.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.6L20 7H6"/><circle cx="10" cy="19" r="1"/><circle cx="18" cy="19" r="1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  };
  return `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
}
function header() {
  const page = document.body.dataset.page;
  return `<header class="site-header"><div class="container header-row"><a class="brand" href="index.html"><img src="assets/images/logo.png" alt="Logo Pastelería SLIM"><span>Pastelería <em>SLIM</em></span></a><nav class="desktop-nav" aria-label="Navegación principal"><a class="${page === "local" ? "active" : ""}" href="locales.html">Local</a><a class="${page === "products" ? "active" : ""}" href="productos.html">Productos</a><a class="${page === "about" ? "active" : ""}" href="nosotros.html">Nosotros</a><a class="${page === "service" ? "active" : ""}" href="servicio-cliente.html">Ayuda</a></nav><form class="header-search" data-global-search><input aria-label="Buscar" name="q" placeholder="Buscar pasteles, tortas..."><button aria-label="Buscar">${icon("search")}</button></form><div class="header-actions"><a class="icon-link" href="carrito.html" aria-label="Carrito">${icon("cart")}<span class="cart-count">${SlimCart.count()}</span></a><a class="icon-link" href="usuario.html" aria-label="Mi cuenta">${icon("user")}</a>${SlimAuth.current() ? `<a class="icon-link" href="admin.html" data-admin-link hidden aria-label="Panel de administración" title="Panel admin" style="font-size:.8rem;font-weight:600;width:auto;padding:0 10px">Admin</a><button class="icon-link" type="button" data-logout aria-label="Cerrar sesión" title="Cerrar sesión">${icon("logout")}</button>` : ""}<button class="icon-link menu-button" data-menu aria-label="Abrir menú">${icon("menu")}</button></div></div><nav class="mobile-menu" data-mobile-menu><a href="locales.html">Local</a><a href="productos.html">Productos</a><a href="buscar.html">Buscar</a><a href="nosotros.html">Sobre nosotros</a><a href="servicio-cliente.html">Servicio al cliente</a></nav></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="container footer-main"><div class="footer-brand"><a class="brand" href="index.html"><img src="assets/images/logo.png" alt="Logo"><span>Pastelería SLIM</span></a><p>Sabores que endulzan tu vida. Creaciones artesanales con ingredientes seleccionados desde 2008.</p><div class="socials"><a href="#" aria-label="Instagram">In</a><a href="#" aria-label="Facebook">Fb</a><a href="#" aria-label="YouTube">Yt</a></div></div>${footerSection("Contacto", '<ul class="footer-list"><li>+51 964 123 456</li><li><a href="mailto:hola@pasteleria-slim.pe">hola@pasteleria-slim.pe</a></li><li>Jr. Puno 456, Huancayo, Perú</li></ul>')}${footerSection("Sobre nosotros", '<ul class="footer-list"><li><a href="nosotros.html">Nuestra historia</a></li><li><a href="nosotros.html#equipo">Nuestro equipo</a></li><li><a href="nosotros.html#proceso">Proceso artesanal</a></li><li><a href="locales.html">Locales</a></li></ul>')}${footerSection("Servicio al cliente", '<ul class="footer-list"><li><a href="servicio-cliente.html#faq">Preguntas frecuentes</a></li><li><a href="servicio-cliente.html#envios">Política de envíos</a></li><li><a href="servicio-cliente.html#devoluciones">Devoluciones</a></li><li><a href="servicio-cliente.html#personalizados">Pedidos personalizados</a></li></ul>')}</div><div class="footer-bottom">© 2026 Pastelería SLIM. Todos los derechos reservados.</div><div class="container claims-strip"><a class="claims-link" href="reclamaciones.html"><span aria-hidden="true">📖</span> Libro de Reclamaciones</a></div></footer>`;
}
function footerSection(title, content) {
  return `<section class="footer-section"><button class="footer-toggle" type="button">${title}<span>+</span></button><h4>${title}</h4><div class="footer-content">${content}</div></section>`;
}
function productCard(p) {
  return `<article class="product-card" data-cat="${p.cat}" data-price="${p.price}" data-rating="${p.rating}" data-name="${p.name.toLowerCase()}">${p.badge ? `<span class="badge ${p.badge === "Oferta" ? "red" : ""}">${p.badge}</span>` : ""}<img loading="lazy" decoding="async" src="assets/images/${p.img}" alt="${p.name}"><div class="product-card-body"><p class="category">${p.cat}</p><h3>${p.name}</h3><div class="rating">★★★★★ <span>${p.rating} (${p.reviews})</span></div><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-add data-id="${p.id}" aria-label="Agregar ${p.name} al carrito">+</button></div></div></article>`;
}
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
function updateBadges() {
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = SlimCart.count();
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  });
}

function initShell() {
  const h = document.querySelector("[data-site-header]"),
    f = document.querySelector("[data-site-footer]");
  if (h) h.outerHTML = header();
  if (f) f.outerHTML = footer();
  document
    .querySelector("[data-menu]")
    ?.addEventListener("click", () =>
      document.querySelector("[data-mobile-menu]").classList.toggle("open"),
    );
  document
    .querySelectorAll(".footer-toggle")
    .forEach((b) =>
      b.addEventListener("click", () =>
        b.parentElement.classList.toggle("open"),
      ),
    );
  document.querySelectorAll("[data-logout]").forEach((button) =>
    button.addEventListener("click", async () => {
      await SlimAuth.logout();
      location.href = "index.html";
    }),
  );
  // Muestra los enlaces de administrador solo si el rol guardado en Supabase es "admin".
  const toggleAdminLinks = (role) =>
    document.querySelectorAll("[data-admin-link]").forEach((el) => (el.hidden = role !== "admin"));
  if (SlimAuth.current()) {
    toggleAdminLinks(SlimAuth.current().role);
    SlimAuth.syncRole().then(toggleAdminLinks).catch(() => {});
  }
  document.querySelectorAll("[data-global-search]").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = new FormData(form).get("q");
      if (String(q).trim())
        location.href = `buscar.html?q=${encodeURIComponent(String(q).trim())}`;
    }),
  );
}
function initAdds() {
  document.addEventListener("click", (e) => {
    const button = e.target.closest("[data-add]");
    if (!button) return;
    const product = PRODUCTS.find((p) => p.id === Number(button.dataset.id));
    if (!product) return;
    SlimCart.add(product);
    updateBadges();
    showToast("Producto agregado al carrito");
  });
}
function initHome() {
  const grid = document.querySelector("[data-featured]");
  if (grid) grid.innerHTML = PRODUCTS.slice(0, 4).map(productCard).join("");
}
function initProducts() {
  const grid = document.querySelector("[data-products]");
  if (!grid) return;
  const search = document.querySelector("#product-search"),
    sort = document.querySelector("#sort"),
    price = document.querySelector("#max-price"),
    count = document.querySelector("[data-count]");
  let cat = new URLSearchParams(location.search).get("cat") || "todos";
  document.querySelectorAll("[data-cat-filter]").forEach((b) => {
    if (b.dataset.catFilter === cat) b.classList.add("active");
    b.addEventListener("click", () => {
      cat = b.dataset.catFilter;
      document
        .querySelectorAll("[data-cat-filter]")
        .forEach((x) => x.classList.toggle("active", x === b));
      render();
    });
  });
  function render() {
    let list = PRODUCTS.filter(
      (p) =>
        (cat === "todos" || p.cat === cat) &&
        p.price <= Number(price.value) &&
        p.name.toLowerCase().includes(search.value.toLowerCase()),
    );
    if (sort.value === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort.value === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort.value === "rating") list.sort((a, b) => b.rating - a.rating);
    grid.innerHTML =
      list.map(productCard).join("") ||
      '<div class="empty">No encontramos productos con esos filtros.</div>';
    count.textContent = `${list.length} productos`;
    document.querySelector("[data-price-value]").textContent = money(
      Number(price.value),
    );
  }
  [search, sort, price].forEach((el) => el.addEventListener("input", render));
  document
    .querySelector("[data-filter-toggle]")
    ?.addEventListener("click", () =>
      document.querySelector("[data-filter-panel]").classList.toggle("hidden"),
    );
  render();
}
function initSearch() {
  const form = document.querySelector("[data-search-form]");
  if (!form) return;
  const input = form.querySelector("input"),
    out = document.querySelector("[data-search-results]"),
    params = new URLSearchParams(location.search);
  input.value = params.get("q") || "";
  function render(q) {
    const term = q.trim().toLowerCase();
    if (!term) {
      out.innerHTML =
        '<h2>Búsquedas populares</h2><div class="tabs">' +
        ["Torta de chocolate", "Pasteles", "Cupcakes", "Macarons", "Galletas"]
          .map(
            (x) => `<button class="chip" data-suggestion="${x}">${x}</button>`,
          )
          .join("") +
        "</div>";
      return;
    }
    const list = PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(term) || p.cat.includes(term),
    );
    out.innerHTML =
      `<p class="muted">${list.length} resultados para “${q}”</p><div class="product-grid">${list.map(productCard).join("")}</div>` +
      (list.length
        ? ""
        : '<div class="empty">Sin resultados. Prueba con otro término.</div>');
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    history.replaceState({}, "", `?q=${encodeURIComponent(input.value)}`);
    render(input.value);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-suggestion]");
    if (b) {
      input.value = b.dataset.suggestion;
      form.requestSubmit();
    }
  });
  render(input.value);
}
function initCart() {
  const list = document.querySelector("[data-cart-list]");
  if (!list) return;
  const cart = SlimCart.load();
  const couponMessage = document.querySelector("[data-coupon-message]");

  function render() {
    list.innerHTML =
      cart.items
        .map(
          (i) => `
        <article class="cart-item">
          <img loading="lazy" decoding="async" src="assets/images/${i.img}" alt="${escapeHtml(i.name)}">
          <div>
            <h3>${escapeHtml(i.name)}</h3>
            <small class="muted">${escapeHtml(i.size)}</small>
            <div>
              <span class="quantity">
                <button data-qty="-1" data-id="${i.id}">−</button>
                <strong>${i.qty}</strong>
                <button data-qty="1" data-id="${i.id}">+</button>
              </span>
              <button class="remove" data-remove="${i.id}">Eliminar</button>
            </div>
          </div>
          <span class="price">${money(i.price * i.qty)}</span>
        </article>`,
        )
        .join("") ||
      '<div class="empty">Tu carrito está vacío. <a class="text-link" href="productos.html">Ver productos</a></div>';
    const t = SlimCart.totals(cart);
    document.querySelector("[data-subtotal]").textContent = money(t.subtotal);
    document.querySelector("[data-shipping]").textContent = t.shipping
      ? money(t.shipping)
      : "Gratis";
    document.querySelector("[data-discount]").textContent = t.off
      ? `−${money(t.off)}`
      : money(0);
    document.querySelector("[data-total]").textContent = money(t.total);
    document.querySelector("[data-cart-title]").textContent =
      `${cart.items.length} productos`;
    if (couponMessage)
      couponMessage.textContent = cart.coupon
        ? "Descuento del 10% aplicado"
        : "";
    SlimCart.save(cart);
    updateBadges();
  }

  list.addEventListener("click", (e) => {
    const qty = e.target.closest("[data-qty]");
    const remove = e.target.closest("[data-remove]");
    if (qty) {
      const item = cart.items.find((i) => i.id === Number(qty.dataset.id));
      item.qty = Math.max(1, item.qty + Number(qty.dataset.qty));
    }
    if (remove)
      cart.items = cart.items.filter(
        (i) => i.id !== Number(remove.dataset.remove),
      );
    render();
  });

  document.querySelector("[data-coupon]")?.addEventListener("click", () => {
    const value = document.querySelector("#coupon").value.toUpperCase();
    if (["SLIM20", "BIENVENIDO"].includes(value)) {
      cart.coupon = true;
      render();
    } else showToast("Cupón no válido");
  });
  render();
}
function initFaq() {
  document
    .querySelectorAll(".faq-question")
    .forEach((b) =>
      b.addEventListener("click", () =>
        b.parentElement.classList.toggle("open"),
      ),
    );
  const form = document.querySelector("[data-contact-form]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    form.innerHTML =
      '<div class="center"><h2>Mensaje enviado</h2><p>Nos pondremos en contacto contigo en menos de 24 horas.</p></div>';
  });
}
function initAccount() {
  document.querySelectorAll("[data-account-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      document
        .querySelectorAll("[data-account-tab]")
        .forEach((x) => x.classList.toggle("active", x === b));
      document
        .querySelectorAll(".account-panel")
        .forEach((p) =>
          p.classList.toggle("active", p.id === b.dataset.accountTab),
        );
    }),
  );

  const form = document.querySelector("[data-profile-form]");
  const user = SlimAuth.current();
  if (!form || !user) return;

  const email = document.querySelector(".profile-head p");
  if (email) email.textContent = user.email;
  const fillForm = (data) =>
    Object.keys(form.elements).forEach(
      (k) => isNaN(k) && data[k] != null && (form.elements[k].value = data[k]),
    );
  fillForm(user);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { email: _email, ...changes } = Object.fromEntries(
      new FormData(form),
    );
    const updated = SlimAuth.updateProfile(changes);
    document.querySelector(".profile-head h1, .profile-head h2").textContent =
      updated.name;
    document.querySelector(".profile-avatar").textContent = updated.name
      .charAt(0)
      .toUpperCase();
    showToast("Datos actualizados");
  });

  const orders = JSON.parse(localStorage.getItem("slim-orders") || "[]")
    .filter((o) => o.email === user.email)
    .reverse();
  document.querySelector("[data-orders-list]").innerHTML =
    orders
      .map(
        (o) => `
      <article class="order-card">
        <div>
          <strong>#${escapeHtml(o.code)}</strong> <span class="status">Recibido</span>
          <p class="muted">
            ${escapeHtml((o.items || []).map((i) => `${i.name} x${i.qty}`).join(", "))}<br>
            <small>${new Date(o.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}</small>
          </p>
        </div>
        <strong class="price">${money(o.total || 0)}</strong>
      </article>`,
      )
      .join("") || '<p class="muted">Aún no has realizado pedidos.</p>';

  // Si Supabase está configurado, la cuenta muestra también los pedidos sincronizados.
  if (window.SlimDB?.configured) {
    window.SlimDB.getMyOrders().then(remoteOrders => {
      if (!remoteOrders.length) return;
      const remoteHtml = remoteOrders.map(o => `
        <article class="order-card">
          <div><strong>#${escapeHtml(o.code)}</strong> <span class="status">${escapeHtml(o.status || "recibido")}</span>
          <p class="muted">${(o.order_items || []).map(i => `${escapeHtml(i.product_name)} x${i.quantity}`).join(", ")}<br>
          <small>${new Date(o.created_at).toLocaleDateString("es-PE")}</small></p></div>
          <strong class="price">${money(o.total || 0)}</strong>
        </article>`).join("");
      const list = document.querySelector("[data-orders-list]");
      if (list) list.innerHTML = remoteHtml;
    }).catch(error => console.error("No se pudieron cargar los pedidos de Supabase:", error));
  }

  document.querySelector("[data-address-list]").innerHTML = user.domicilio
    ? `<article class="address-card"><strong>Principal</strong><p class="muted">${escapeHtml(user.domicilio)}<br>${escapeHtml(user.distrito || "")}</p></article>`
    : '<p class="muted">Aún no registraste una dirección.</p>';
}
function initLogin() {
  const form = document.querySelector("[data-login-form]");
  if (!form) return;
  const tabs = {
    login: document.querySelector('[data-mode="login"]'),
    register: document.querySelector('[data-mode="register"]'),
  };
  const registerOnly = document.querySelectorAll(
    "[data-register-field], [data-confirm-field]",
  );
  const title = document.querySelector("[data-auth-title]");
  const notice = document.querySelector("[data-auth-notice]");
  const errorBox = document.querySelector("[data-auth-error]");
  const params = new URLSearchParams(location.search);
  const requested = params.get("next") || "";
  // Los clientes vuelven a la compra si venían de ahí; si no, van al inicio.
  const next = ["checkout.html", "carrito.html"].includes(requested) ? requested : "index.html";
  let isRegister = false;

  function setMode(mode) {
    isRegister = mode === "register";
    tabs.login.classList.toggle("active", !isRegister);
    tabs.register.classList.toggle("active", isRegister);
    registerOnly.forEach((el) => {
      el.classList.toggle("hidden", !isRegister);
      el.querySelectorAll("input, select").forEach(
        (field) => (field.required = isRegister),
      );
    });
    title.textContent = isRegister ? "Crea tu cuenta" : "Bienvenido de vuelta";
    errorBox.textContent = "";
  }

  function showSession(user) {
    notice.classList.remove("hidden");
    notice.replaceChildren();
    const strong = document.createElement("strong");
    strong.textContent = user.name;
    const logout = document.createElement("button");
    logout.type = "button";
    logout.className = "text-link";
    logout.textContent = "Cerrar sesión";
    logout.addEventListener("click", async () => {
      await SlimAuth.logout();
      location.reload();
    });
    notice.append("Sesión iniciada como ", strong, ". ", logout);
  }

  const session = SlimAuth.current();
  if (session) showSession(session);
  else if (requested) {
    notice.classList.remove("hidden");
    notice.textContent =
      "Para realizar un pedido necesitas iniciar sesión o crear una cuenta.";
  }

  tabs.login.addEventListener("click", () => setMode("login"));
  tabs.register.addEventListener("click", () => setMode("register"));
  document
    .querySelector("[data-show-password]")
    ?.addEventListener("click", (e) => {
      const input = document.querySelector("#password");
      input.type = input.type === "password" ? "text" : "password";
      e.currentTarget.textContent =
        input.type === "password" ? "Ver" : "Ocultar";
    });

  if (!session && requested) setMode("register");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const { password, confirm, ...profile } = data;
    errorBox.textContent = "";
    if (isRegister) {
      if (profile.tipoDoc === "DNI" && !/^\d{8}$/.test(profile.numeroDoc)) {
        errorBox.textContent = "El DNI debe tener 8 dígitos.";
        return;
      }
      if (password.length < 8) {
        errorBox.textContent =
          "La contraseña debe tener al menos 8 caracteres.";
        return;
      }
      if (password !== confirm) {
        errorBox.textContent = "Las contraseñas no coinciden.";
        return;
      }
    }
    const result = isRegister
      ? await SlimAuth.register({ ...profile, password })
      : await SlimAuth.login(profile.email, password);
    if (!result.ok) {
      errorBox.textContent = result.error;
      return;
    }
    if (result.needsEmailConfirmation) {
      notice.classList.remove("hidden");
      notice.textContent = "Cuenta creada. Revisa tu correo para confirmar la cuenta y luego inicia sesión.";
      setMode("login");
      return;
    }
    location.href = result.role === "admin" ? "admin.html" : next;
  });
}
function initAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const targets = document.querySelectorAll(
    "main > section, .product-card, .category-card, .value-card, .team-card, .location-card, .testimonial, .contact-card, .quick-link, .timeline-item, .cart-item, .checkout-card",
  );
  targets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 6) * 65}ms`);
  });
  if (!("IntersectionObserver" in window)) {
    targets.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px" },
  );
  targets.forEach((element) => observer.observe(element));
}
async function initCheckout() {
  const area = document.querySelector("[data-checkout-area]");
  if (!area) return;
  const summary = document.querySelector("[data-checkout-summary]");
  const user = SlimAuth.current();
  if (!user) {
    SlimAuth.require("checkout.html");
    return;
  }

  const snapshot = SlimCart.load();
  if (!snapshot.items.length) {
    area.innerHTML = `<div class="checkout-card empty-checkout"><h2>Tu carrito está vacío</h2><p>Agrega tus productos favoritos antes de continuar.</p><a class="btn" href="productos.html">Explorar productos</a></div>`;
    if (summary) summary.innerHTML = "";
    return;
  }

  const order = {
    delivery: "recojo",
    localId: LOCALES[0].id,
    data: {
      fullname: user.name || "",
      phone: user.telefono || "",
      address: user.domicilio || "",
      district: user.distrito || "",
    },
    payment: "Pago en tienda",
  };
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  let step = 0;
  let saving = false;

  const field = (name, label, attrs = "") => `
    <div class="field">
      <label class="field-label" for="f-${name}">${label}</label>
      <input class="input" id="f-${name}" name="${name}" value="${escapeHtml(order.data[name] ?? "")}" ${attrs}>
    </div>`;
  const timeSelect = (name, label) => `
    <div class="field">
      <label class="field-label" for="f-${name}">${label}</label>
      <select class="select browser-default" id="f-${name}" name="${name}" required>
        <option value="">Selecciona un horario</option>
        ${["Mañana (8:00 a. m. – 12:00 p. m.)", "Tarde (12:00 p. m. – 5:00 p. m.)", "Noche (5:00 p. m. – 8:00 p. m.)"].map(t => `<option value="${t}" ${order.data[name] === t ? "selected" : ""}>${t}</option>`).join("")}
      </select>
    </div>`;
  function collect() {
    area.querySelectorAll("input[name], select[name], textarea[name]").forEach(el => {
      if (el.type === "radio") {
        if (el.checked) order.data[el.name] = el.value;
      } else order.data[el.name] = el.value;
    });
  }
  function validate() {
    const required = [...area.querySelectorAll("[required]")];
    for (const el of required) {
      if (!el.reportValidity()) return false;
    }
    return true;
  }
  function deliveryStep() {
    const isHome = order.delivery === "domicilio";
    const local = LOCALES.find(l => l.id === order.localId) || LOCALES[0];
    const homeFields = `
      ${field("address", "Dirección de entrega", "required autocomplete='street-address' placeholder='Av. / Jr. / Calle y número'")}
      <div class="form-grid">
        ${field("district", "Distrito", "required placeholder='Ej. Huancayo'")}
        ${field("reference", "Referencia (opcional)", "placeholder='Cerca de...'")}
      </div>`;
    const pickupFields = `
      <div class="field">
        <label class="field-label" for="f-local">Selecciona una tienda</label>
        <select class="select browser-default" id="f-local" data-local>
          ${LOCALES.map(l => `<option value="${l.id}" ${l.id === order.localId ? "selected" : ""}>${l.name}</option>`).join("")}
        </select>
      </div>
      <div class="store-detail">
        <div class="store-detail-icon">⌖</div>
        <div><strong>${escapeHtml(local.name)}</strong><p>${escapeHtml(local.address)}</p><small>Horario: ${escapeHtml(local.hours)}</small></div>
      </div>`;
    return `
      <div class="checkout-card">
        <p class="eyebrow">Paso 1 · Entrega</p>
        <h2>¿Cómo deseas recibir tu pedido?</h2>
        <p class="muted">Hola, <strong>${escapeHtml(user.name)}</strong>. Elige la modalidad que más te convenga.</p>
        <div class="delivery-choice-grid">
          <label class="delivery-choice ${isHome ? "selected" : ""}">
            <input type="radio" name="delivery" value="domicilio" ${isHome ? "checked" : ""}>
            <span class="choice-icon">🚚</span><strong>Envío a domicilio</strong>
            <small>Recibe tu pedido en la dirección que indiques.</small><b>Envío S/ 80.00</b>
          </label>
          <label class="delivery-choice ${!isHome ? "selected" : ""}">
            <input type="radio" name="delivery" value="recojo" ${!isHome ? "checked" : ""}>
            <span class="choice-icon">🏬</span><strong>Recojo en tienda</strong>
            <small>Recoge tu compra en una de nuestras sucursales.</small><b>Sin costo adicional</b>
          </label>
        </div>
        <div class="checkout-fields">
          <h3>${isHome ? "Datos para la entrega" : "Tienda de recojo"}</h3>
          <div class="form-grid">
            ${field("fullname", "Nombre de quien recibe", "required autocomplete='name'")}
            ${field("phone", "Teléfono de contacto", "required type='tel' inputmode='tel' pattern='[0-9+ ]{9,15}' placeholder='999 999 999'")}
          </div>
          ${isHome ? homeFields : pickupFields}
          <div class="form-grid">
            ${field("date", isHome ? "Fecha de entrega" : "Fecha de recojo", `required type="date" min="${today}"`)}
            ${timeSelect("slot", isHome ? "Horario de entrega" : "Horario de recojo")}
          </div>
        </div>
        <button class="btn full" data-next>Continuar al pago →</button>
      </div>`;
  }
  function paymentStep() {
    const methods = order.delivery === "recojo"
      ? ["Pago en tienda", "Transferencia bancaria", "Tarjeta de crédito/débito"]
      : ["Transferencia bancaria", "Tarjeta de crédito/débito"];
    if (!methods.includes(order.payment)) order.payment = methods[0];
    return `
      <div class="checkout-card">
        <p class="eyebrow">Paso 2 · Pago</p><h2>Selecciona tu método de pago</h2>
        <p class="muted">Esta versión académica registra el método elegido, pero no procesa transacciones reales.</p>
        ${methods.map((m, i) => `<label class="payment-option ${order.payment === m ? "selected" : ""}">
          <input type="radio" name="payment" value="${m}" ${order.payment === m ? "checked" : ""}>
          <span><strong>${["Pago al recoger", "Transferencia bancaria", "Tarjeta de crédito o débito"][methods.indexOf(m)]}</strong><br><small>${m === "Pago en tienda" ? "Paga cuando recojas tu pedido." : m === "Transferencia bancaria" ? "Se coordinará la validación del pago." : "Pasarela de pago pendiente de integración."}</small></span>
        </label>`).join("")}
        <div class="checkout-actions"><button class="btn outline" type="button" data-back>← Volver</button><button class="btn" type="button" data-next>Confirmar pedido →</button></div>
      </div>`;
  }
  function renderSummary() {
    if (!summary) return;
    const t = SlimCart.totals(snapshot, order.delivery === "recojo");
    const shipping = order.delivery === "recojo" ? "Gratis" : (t.shipping ? money(t.shipping) : "Gratis");
    summary.innerHTML = `<h3>Resumen de tu compra</h3>
      ${snapshot.items.map(i => `<div class="summary-line"><span>${escapeHtml(i.name)} × ${i.qty}</span><strong>${money(i.price * i.qty)}</strong></div>`).join("")}
      <div class="summary-line"><span>Modalidad</span><strong>${order.delivery === "recojo" ? "Recojo en tienda" : "Envío a domicilio"}</strong></div>
      <div class="summary-line"><span>Envío</span><strong>${shipping}</strong></div>
      ${t.off ? `<div class="summary-line"><span>Descuento</span><strong>−${money(t.off)}</strong></div>` : ""}
      <div class="summary-line total"><span>Total</span><strong>${money(t.total)}</strong></div>
      <p class="checkout-safe">🔒 Tus datos se utilizan únicamente para gestionar el pedido.</p>`;
  }
  async function saveOrder() {
    const seq = Number(localStorage.getItem("slim-order-seq") || 2847) + 1;
    localStorage.setItem("slim-order-seq", String(seq));
    let code = `SL-${seq}`;
    const t = SlimCart.totals(snapshot, order.delivery === "recojo");
    const local = LOCALES.find(l => l.id === order.localId) || LOCALES[0];
    const payload = {
      code, email: user.email, delivery: order.delivery, localId: order.localId,
      localName: local.name, payment: order.payment, data: {...order.data},
      items: snapshot.items.map(i => ({...i})), subtotal: t.subtotal,
      shipping: t.shipping, discount: t.off, total: t.total, createdAt: new Date().toISOString()
    };
    if (window.SlimDB?.saveOrder) {
      try {
        const created = await window.SlimDB.saveOrder(payload);
        if (created?.code) { code = created.code; payload.code = code; }
      }
      catch (error) { console.error("Supabase:", error); showToast("No se pudo sincronizar con Supabase (" + (error?.message || "error") + "); se guardará localmente."); }
    }
    const saved = JSON.parse(localStorage.getItem("slim-orders") || "[]");
    saved.push(payload);
    localStorage.setItem("slim-orders", JSON.stringify(saved));
    SlimCart.clear();
    updateBadges();
    const where = order.delivery === "domicilio"
      ? `${order.data.address}, ${order.data.district}`
      : `${local.name} · ${local.address}`;
    area.innerHTML = `<div class="checkout-card confirmation">
      <div class="confirmation-mark">✓</div><p class="eyebrow">Paso 3 · Confirmación</p>
      <h2>¡Pedido registrado!</h2><p>Tu pedido <strong>#${code}</strong> fue registrado correctamente.</p>
      <div class="info-box"><strong>${order.delivery === "domicilio" ? "Envío a domicilio" : "Recojo en tienda"}</strong><p>${escapeHtml(where)}</p><p>${escapeHtml(order.data.date)} · ${escapeHtml(order.data.slot)}</p><p>Método de pago: ${escapeHtml(order.payment)}</p></div>
      <div class="button-row"><a class="btn outline" href="index.html">Ir al inicio</a><a class="btn" href="usuario.html">Ver mis pedidos</a></div>
    </div>`;
    document.querySelectorAll(".step").forEach((el, i) => el.classList.toggle("active", i <= 2));
    if (summary) summary.innerHTML = `<h3>Pedido ${code}</h3><p>Estado: <strong>Registrado</strong></p><strong class="price">${money(t.total)}</strong>`;
  }
  function bind() {
    area.querySelectorAll('input[name="delivery"]').forEach(radio => radio.addEventListener("change", () => {
      collect(); order.delivery = radio.value;
      if (order.delivery === "recojo") order.payment = "Pago en tienda";
      else if (order.payment === "Pago en tienda") order.payment = "Transferencia bancaria";
      render();
    }));
    area.querySelector("[data-local]")?.addEventListener("change", e => { collect(); order.localId = e.target.value; render(); });
    area.querySelectorAll('input[name="payment"]').forEach(radio => radio.addEventListener("change", () => {
      order.payment = radio.value;
      area.querySelectorAll(".payment-option").forEach(label => label.classList.toggle("selected", label.querySelector("input")?.checked));
    }));
    area.querySelector("[data-back]")?.addEventListener("click", () => { collect(); step = 0; render(); });
    area.querySelector("[data-next]")?.addEventListener("click", async () => {
      if (step === 0) {
        if (!validate()) { showToast("Completa los campos obligatorios (fecha y horario)."); return; }
        collect(); step = 1; render(); return;
      }
      if (step === 1) {
        const selected = area.querySelector('input[name="payment"]:checked');
        if (!selected) { showToast("Selecciona un método de pago."); return; }
        order.payment = selected.value;
        const button = area.querySelector("[data-next]");
        button.disabled = true; button.textContent = "Registrando pedido...";
        if (saving) return;
        saving = true;
        try { await saveOrder(); }
        catch (error) {
          console.error("Checkout:", error);
          showToast("No se pudo confirmar el pedido: " + (error?.message || "error desconocido"));
          button.disabled = false; button.textContent = "Confirmar pedido →";
        }
        finally { saving = false; }
      }
    });
  }
  function render() {
    document.querySelectorAll(".step").forEach((el, i) => el.classList.toggle("active", i <= step));
    area.innerHTML = step === 0 ? deliveryStep() : paymentStep();
    renderSummary(); bind();
  }
  render();
}

document.addEventListener("DOMContentLoaded", async () => {
  // Si Supabase está configurado, el catálogo publicado se obtiene de la misma tabla
  // que administra el panel. Si falla la conexión, se conserva el catálogo de demostración.
  if (window.SlimDB?.configured) {
    try {
      const { data, error } = await window.SlimDB.client.from("products").select("*").eq("active", true).order("id");
      if (error) throw error;
      if (data?.length) PRODUCTS = data.map(p => ({ id:Number(p.id), name:p.name, price:Number(p.price), rating:4.8, reviews:0, badge:"", cat:p.category_id || "especiales", img:p.image || "cake-chocolate.webp" }));
    } catch (error) { console.warn("No se pudo cargar el catálogo remoto; se usa el catálogo local.", error); }
  }
  if (document.body.dataset.page === "user") {
    if (!SlimAuth.require("usuario.html")) return;
    const { name } = SlimAuth.current();
    const heading = document.querySelector(
      ".profile-head h1, .profile-head h2",
    );
    if (heading) heading.textContent = name;
    const avatar = document.querySelector(".profile-avatar");
    if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
  }
  initShell();
  initAdds();
  initHome();
  initProducts();
  initSearch();
  initCart();
  initFaq();
  initAccount();
  initLogin();
  initCheckout();
  initAnimations();
});
