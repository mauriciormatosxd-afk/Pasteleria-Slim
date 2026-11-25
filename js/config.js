// Datos configurables del negocio. Completar antes de publicar el sitio.
const LOCALES = [
  {
    id: "centro",
    code: "CEN",
    name: "SLIM Centro",
    address: "Jr. Puno 456, Cercado de Huancayo",
    hours: "Lun–Sáb 8am–9pm, Dom 9am–7pm",
  },
  {
    id: "el-tambo",
    code: "TAM",
    name: "SLIM El Tambo",
    address: "Av. Mariscal Castilla 1250, El Tambo",
    hours: "Lun–Sáb 8am–10pm, Dom 9am–8pm",
  },
  {
    id: "chilca",
    code: "CHI",
    name: "SLIM Chilca",
    address: "Av. Leoncio Prado 680, Chilca",
    hours: "Lun–Dom 9am–9pm",
  },
];

// Datos del proveedor exigidos en la Hoja de Reclamación (Reglamento del Libro de Reclamaciones).
const PROVIDER = {
  razonSocial: "[Completar: razón social]",
  ruc: "[Completar: RUC]",
  domicilioLegal: "[Completar: domicilio fiscal]",
  email: "[Completar: correo de atención de reclamos]",
};

// URL de un servicio que reciba la hoja (JSON) y envíe copia al correo del consumidor.
// Si queda vacía, la hoja solo se guarda en este navegador y se puede imprimir.
const CLAIMS_ENDPOINT = "";


// Supabase: completa estos valores con Project URL y anon/publishable key.
// Nunca coloques la service_role key en el frontend.
window.SUPABASE_CONFIG = {
  url: "https://jkiqeelpipsacraycano.supabase.co",
  anonKey: "sb_publishable_g2kAHbXOUF7wXI2m6xHheg_764E-8w3",
};
