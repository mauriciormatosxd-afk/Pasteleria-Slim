// Cuentas de usuario (demostración con localStorage; en producción usar un servidor).
const SlimAuth = (() => {
  const USERS_KEY = "slim-users";
  const SESSION_KEY = "slim-session";

  const read = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };

  async function hash(text) {
    if (!window.crypto?.subtle) return btoa(unescape(encodeURIComponent(text)));
    const buffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text),
    );
    return [...new Uint8Array(buffer)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const fullName = (user) =>
    `${user.nombres ?? user.name ?? ""} ${user.apellidos ?? ""}`.trim();
  const publicProfile = ({ passwordHash, ...profile }) => ({
    ...profile,
    name: fullName(profile),
  });
  const setSession = (user) =>
    localStorage.setItem(SESSION_KEY, JSON.stringify(publicProfile(user)));
  const current = () => read(SESSION_KEY, null);

  // `profile` trae nombres, apellidos, tipoDoc, numeroDoc, telefono, domicilio, distrito y email.
  async function register({ password, ...profile }) {
    const users = read(USERS_KEY, []);
    const email = profile.email.trim().toLowerCase();
    if (window.SlimDB?.configured) {
      const result = await window.SlimDB.signUp(email, password, profile);
      if (result?.error) return { ok: false, error: result.error.message };
      if (!result?.data?.session) {
        return { ok: true, needsEmailConfirmation: true };
      }
      const user = { ...profile, email, id: result?.data?.user?.id || null };
      setSession(user);
      SlimCart.adoptGuest(email);
      return { ok: true };
    }
    if (users.some((user) => user.email === email)) {
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    }
    const user = { ...profile, email, passwordHash: await hash(password) };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
    setSession(user);
    SlimCart.adoptGuest(email);
    return { ok: true };
  }

  async function login(email, password) {
    email = email.trim().toLowerCase();
    if (window.SlimDB?.configured) {
      const result = await window.SlimDB.signIn(email, password);
      if (result?.error) return { ok: false, error: "Correo o contraseña incorrectos: " + result.error.message };
      const authUser = result?.data?.user;
      const role = (await window.SlimDB.getRole().catch(() => null)) || "customer";
      const user = { ...(authUser?.user_metadata || {}), id: authUser?.id, email: authUser?.email || email, role };
      setSession(user);
      SlimCart.adoptGuest(email);
      return { ok: true, role };
    }
    const user = read(USERS_KEY, []).find((u) => u.email === email);
    if (!user || user.passwordHash !== (await hash(password))) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    setSession(user);
    SlimCart.adoptGuest(email);
    return { ok: true };
  }

  // Guarda cambios del perfil (el correo no se modifica).
  function updateProfile(changes) {
    const session = current();
    if (!session) return null;
    const users = read(USERS_KEY, []).map((u) =>
      u.email === session.email ? { ...u, ...changes, email: u.email } : u,
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    if (window.SlimDB?.configured) window.SlimDB.updateProfile(changes).catch(console.error);
    const updated = users.find((u) => u.email === session.email) || { ...session, ...changes, email: session.email };
    setSession(updated);
    return current();
  }

  const logout = async () => {
    localStorage.removeItem(SESSION_KEY);
    if (window.SlimDB?.configured) {
      try { await window.SlimDB.signOut(); } catch (error) { console.error(error); }
    }
  };
  // Actualiza el rol guardado en la sesión local (por si cambió en la base de datos).
  async function syncRole() {
    const session = current();
    if (!session || !window.SlimDB?.configured) return session?.role || null;
    const role = await window.SlimDB.getRole().catch(() => null);
    if (role && role !== session.role) setSession({ ...session, role });
    return role;
  }

  // Redirige al login si no hay sesión. `next` es la página a la que volver.
  function require(next) {
    if (current()) return true;
    location.replace(`login.html?next=${encodeURIComponent(next)}`);
    return false;
  }

  return { current, register, login, logout, updateProfile, require, syncRole };
})();

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
