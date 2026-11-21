/* NostraPORTAL: funciones puras para autorización de interfaz y catálogo público.
   No consulta matrículas, asistencias ni movimientos financieros desde el cliente. */
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const thumb = /^miniaturas\/[a-z0-9][a-z0-9._-]*\.(?:png|jpg|jpeg|webp)$/i;

export function isActiveStudent(profile) {
  return !!profile
    && profile.role === 'student'
    && profile.status === 'active'
    && profile.blocked === false;
}

export function safeLab(entry) {
  if (!entry || entry.publicado !== true || !slug.test(String(entry.id || ''))) return null;
  const id = String(entry.id);
  const title = String(entry.titulo || '').trim().slice(0, 120);
  if (!title) return null;
  const image = String(entry.miniatura || '');
  return {
    id,
    title,
    course: String(entry.curso || 'Ciencias').trim().slice(0, 50),
    description: String(entry.descripcion || '').trim().slice(0, 180),
    url: 'nostralab/laboratorio.html?id=' + encodeURIComponent(id),
    thumbnail: thumb.test(image) && !image.includes('..') ? 'nostralab/' + image : ''
  };
}

export function publicLabs(manifest) {
  if (!manifest || !Array.isArray(manifest.experiencias)) return [];
  const ids = new Set();
  return manifest.experiencias.map(safeLab).filter(item => {
    if (!item || ids.has(item.id)) return false;
    ids.add(item.id);
    return true;
  });
}

export const portalSections = Object.freeze([
  {id:'mis-clases', title:'Mis clases', description:'Accede a las clases en vivo por Microsoft Teams.', href:'clases-en-vivo.html', icon:'▶', status:'Disponible'},
  {id:'nostrachat', title:'NostraCHAT', description:'Comunidad y acompañamiento académico.', href:'nostrachat.html', icon:'✦', status:'Disponible'},
  {id:'mis-asistencias', title:'Mis asistencias', description:'Historial individual de entradas, salidas y tardanzas. La marcación continúa por QR en la sede.', href:'', icon:'✓', status:'Integración segura pendiente'},
  {id:'mis-notas', title:'Mis notas y reportes', description:'Reportes NostraREPORTES asignados a tu cuenta después de la validación de identidad y privacidad.', href:'', icon:'▥', status:'Integración segura pendiente'},
  {id:'mis-pagos', title:'Mis pagos', description:'Matrícula acordada, cuotas y abonos confirmados por Coordinación.', href:'', icon:'S/', status:'Integración segura pendiente'},
  {id:'mi-matricula', title:'Mi matrícula', description:'Programa, plan, turno, aula y sede oficiales.', href:'', icon:'▦', status:'Integración segura pendiente'},
  {id:'mis-materiales', title:'Materiales académicos', description:'Prácticas, exámenes y solucionarios autorizados para tu ciclo.', href:'', icon:'▤', status:'Integración segura pendiente'},
  {id:'mi-progreso', title:'Mi progreso', description:'Evolución académica basada en evaluaciones validadas.', href:'', icon:'↗', status:'Integración segura pendiente'},
  {id:'mis-comunicados', title:'Comunicados', description:'Avisos e información oficial de Coordinación Académica.', href:'', icon:'◉', status:'Integración segura pendiente'},
  {id:'soporte', title:'Soporte', description:'Contacta a Coordinación Académica por WhatsApp.', href:'https://wa.me/51993750351?text=Hola%20Grupo%20Nostradamus%2C%20necesito%20soporte%20con%20mi%20NostraCUENTA.', icon:'?', status:'Disponible'}
]);
