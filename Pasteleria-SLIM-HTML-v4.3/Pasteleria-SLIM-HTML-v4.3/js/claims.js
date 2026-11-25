// Libro de Reclamaciones virtual (Ley 29571 y Reglamento D.S. 011-2011-PCM, modificatorias).
const CLAIM_DEADLINE_DAYS = 15; // días hábiles improrrogables (Ley 31435)

function addBusinessDays(start, days) {
  const date = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) remaining--;
  }
  return date;
}

const formatDate = (date) =>
  date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function initClaims() {
  const form = document.querySelector("[data-claim-form]");
  if (!form) return;
  const result = document.querySelector("[data-claim-result]");
  const now = new Date();

  document
    .querySelectorAll("[data-provider]")
    .forEach((el) => (el.textContent = PROVIDER[el.dataset.provider]));
  document.querySelector("[data-claim-date]").textContent = formatDate(now);
  form.elements.local.innerHTML = LOCALES.map(
    (l) => `<option value="${l.id}">${l.name} — ${l.address}</option>`,
  ).join("");

  const session = SlimAuth.current();
  if (session) {
    [
      "nombres",
      "apellidos",
      "tipoDoc",
      "numeroDoc",
      "domicilio",
      "distrito",
      "telefono",
      "email",
    ].forEach((key) => {
      if (session[key] && form.elements[key])
        form.elements[key].value = session[key];
    });
  }

  const guardian = document.querySelector("[data-guardian]");
  form.elements.menor.addEventListener("change", (e) => {
    guardian.classList.toggle("hidden", !e.target.checked);
    guardian
      .querySelectorAll("input")
      .forEach((input) => (input.required = e.target.checked));
  });

  const row = (label, value) =>
    `<dt>${label}</dt><dd>${escapeHtml(value) || "—"}</dd>`;

  function renderSheet(claim) {
    const local = LOCALES.find((l) => l.id === claim.local);
    return `
      <article class="claim-sheet checkout-card">
        <header>
          <h2>Hoja de Reclamación</h2>
          <p class="claim-number">N° ${claim.code}</p>
          <p class="muted">Fecha: ${formatDate(new Date(claim.createdAt))}</p>
        </header>
        <h3>1. Proveedor</h3>
        <dl>${row("Razón social", PROVIDER.razonSocial)}${row("RUC", PROVIDER.ruc)}${row("Establecimiento", `${local.name} — ${local.address}`)}</dl>
        <h3>2. Consumidor</h3>
        <dl>${row("Nombre", `${claim.nombres} ${claim.apellidos}`)}${row(claim.tipoDoc, claim.numeroDoc)}${row("Domicilio", `${claim.domicilio}, ${claim.distrito}`)}${row("Teléfono", claim.telefono)}${row("Correo", claim.email)}${claim.menor ? row("Padre, madre o representante", `${claim.repNombre} (${claim.repDoc})`) : ""}</dl>
        <h3>3. Bien contratado</h3>
        <dl>${row("Tipo", claim.tipoBien)}${row("N° de pedido", claim.pedido)}${row("Monto reclamado", claim.monto ? `S/ ${claim.monto}` : "")}${row("Descripción", claim.descripcion)}</dl>
        <h3>4. Detalle de la ${claim.tipo.toLowerCase()}</h3>
        <dl>${row("Tipo", claim.tipo)}${row("Detalle", claim.detalle)}${row("Pedido del consumidor", claim.pedidoConsumidor)}</dl>
        <h3>5. Observaciones y acciones adoptadas por el proveedor</h3>
        <p class="muted">Pendiente de respuesta. Plazo máximo: ${CLAIM_DEADLINE_DAYS} días hábiles improrrogables (hasta el ${formatDate(addBusinessDays(claim.createdAt, CLAIM_DEADLINE_DAYS))}, sin contar feriados).</p>
        <p class="info-box" data-claim-delivery></p>
        <div class="button-row no-print">
          <button class="btn" type="button" data-print>Imprimir o guardar PDF</button>
          <a class="btn outline" href="index.html">Volver al inicio</a>
        </div>
      </article>`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const local = LOCALES.find((l) => l.id === data.local);
    const year = new Date().getFullYear();
    const key = `slim-claim-seq-${local.id}`;
    const seq = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, seq);
    const claim = {
      ...data,
      menor: Boolean(data.menor),
      code: `${local.code}-${String(seq).padStart(6, "0")}-${year}`,
      createdAt: new Date().toISOString(),
    };
    delete claim.acepto;

    let savedRemotely = false;
    if (window.SlimDB?.configured) {
      try {
        const remoteCode = await window.SlimDB.saveClaim(claim);
        if (remoteCode) { claim.code = remoteCode; savedRemotely = true; }
      } catch (error) {
        console.error("Supabase (reclamo):", error);
      }
    }

    const all = JSON.parse(localStorage.getItem("slim-claims") || "[]");
    localStorage.setItem("slim-claims", JSON.stringify([...all, claim]));

    form.classList.add("hidden");
    result.innerHTML = renderSheet(claim);
    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth" });
    result
      .querySelector("[data-print]")
      .addEventListener("click", () => window.print());

    const delivery = result.querySelector("[data-claim-delivery]");
    delivery.textContent =
      "Conserva este número para el seguimiento de tu reclamo. Guarda o imprime esta hoja como constancia.";
    if (CLAIMS_ENDPOINT) {
      try {
        const response = await fetch(CLAIMS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(claim),
        });
        if (response.ok)
          delivery.textContent = `Enviamos una copia de esta hoja a ${claim.email}. Conserva el número ${claim.code} para el seguimiento.`;
      } catch {
        /* se mantiene el mensaje de constancia local */
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", initClaims);
