/* NostraPORTAL 2.0 — fase 1. Sólo UI y catálogo público de NostraLAB.
   Los datos sensibles requieren una asociación oficial de identidad antes de mostrarse. */
import {publicLabs, portalSections, isActiveStudent} from './nostraportal-model.mjs?v=2026-11-21-1';

const $ = id => document.getElementById(id);
function element(tag, cls, content){
  const node=document.createElement(tag);
  if(cls) node.className=cls;
  if(content !== undefined && content !== null) node.textContent=String(content);
  return node;
}
function externalAttrs(anchor){
  if((anchor.getAttribute('href') || '').startsWith('https://')){anchor.target='_blank';anchor.rel='noopener noreferrer';}
  return anchor;
}
function link(text, href, style){
  const a=element('a',style,text);
  a.href=href;
  return externalAttrs(a);
}
function label(text, className='np-eyebrow'){
  return element('span',className,text);
}
function toolCard(module){
  const available=Boolean(module.href);
  const card=element(available?'a':'article','np-tool '+(available?'np-tool--active':'np-tool--pending'));
  card.id=module.id;
  if(available){
    card.href=module.href;
    externalAttrs(card);
  }
  const head=element('div','np-tool-head');
  head.append(element('span','np-tool-icon',module.icon),label(available?'Acceso disponible':'Próxima integración','np-tool-status'));
  card.append(head,element('h3','np-tool-title',module.title),element('p','np-tool-description',module.description));
  if(available)card.append(element('span','np-tool-cta','Abrir acceso  ↗'));
  else card.append(element('span','np-tool-pending','Disponible cuando se vincule la ficha oficial'));
  return card;
}
function labCard(item){
  const card=link('',item.url,'np-lab-card');
  card.setAttribute('aria-label','Abrir laboratorio: '+item.title);
  const cover=element('div','np-lab-cover');
  if(item.thumbnail){
    const img=element('img','np-lab-image');
    img.src=item.thumbnail;
    img.alt='';
    img.loading='lazy';
    img.decoding='async';
    cover.append(img);
  } else cover.append(element('span','np-lab-placeholder','NostraLAB'));
  cover.append(label(item.course,'np-lab-course'));
  const body=element('div','np-lab-info');
  body.append(element('h3','np-lab-name',item.title),element('p','np-lab-desc',item.description),element('span','np-lab-open','Experimentar  ↗'));
  card.append(cover,body);
  return card;
}

async function loadLabs(container, status, count){
  try{
    const response=await fetch('nostralab/catalogo.json',{cache:'no-store',credentials:'omit'});
    if(!response.ok)throw Error('catalogo-no-disponible');
    const entries=publicLabs(await response.json());
    if(!container.isConnected)return;
    container.replaceChildren();
    count.textContent=String(entries.length);
    if(!entries.length){
      container.append(element('p','np-empty','No hay experiencias publicadas en el catálogo en este momento.'));
    }else{
      entries.slice(0,4).forEach(item=>container.append(labCard(item)));
    }
    status.textContent='Experiencias oficiales publicadas';
  }catch(error){
    if(!container.isConnected)return;
    container.replaceChildren(element('p','np-empty','No pudimos cargar las experiencias. Utiliza el acceso al catálogo completo.'));
    count.textContent='—';
    status.textContent='Catálogo temporalmente no disponible';
    console.warn('NostraPORTAL: catálogo público no disponible',error);
  }
}

export function renderNostraPortal(profile){
  if(!isActiveStudent(profile))return false;
  const root=$('nostraportal-body');
  if(!root)return false;
  root.replaceChildren();
  const greeting=String(profile.name || profile.username || 'Alumno').trim().split(/\s+/)[0].slice(0,40);
  const intro=element('section','np-intro');
  intro.id='np-inicio';
  const introCopy=element('div','np-intro-copy');
  introCopy.append(label('TU CENTRO DE APRENDIZAJE','np-intro-kicker'),
    element('h1','np-main-title','¡Hola, '+greeting+'!'),
    element('p','np-intro-lead','Todo tu mundo académico en un solo lugar. Explora laboratorios, ingresa a tus clases y encuentra tus servicios institucionales.'));
  const actions=element('div','np-intro-actions');
  actions.append(link('Explorar NostraLAB','#nostralab','np-button np-button-primary'),
                 link('Ir a mis clases','clases-en-vivo.html','np-button np-button-outline'));
  introCopy.append(actions);
  const introMark=element('div','np-intro-mark');
  introMark.setAttribute('aria-hidden','true');
  introMark.append(element('span','np-intro-orbit','N'),element('span','np-intro-orbit-sub','UNI'));
  intro.append(introCopy,introMark);
  root.append(intro);

  const summary=element('section','np-summary');
  summary.setAttribute('aria-label','Estado de tu cuenta');
  [
    ['Cuenta institucional','Activa','NostraCUENTA'],
    ['NostraLAB','—','Laboratorios publicados'],
    ['Datos personales','Restringidos','Sólo cuando se verifique tu vínculo académico']
  ].forEach((tuple,i)=>{
    const box=element('article','np-summary-card');
    box.append(label(tuple[0],'np-summary-label'),element('strong','np-summary-value',tuple[1]),
               element('small','np-summary-foot',tuple[2]));
    if(i===1)box.querySelector('strong').id='np-labs-counter';
    summary.append(box);
  });
  root.append(summary);

  const section=element('section','np-section');
  section.id='np-accesos';
  const titleRow=element('div','np-section-title');
  const titles=element('div');
  titles.append(label('SERVICIOS ACADÉMICOS'),element('h2','','Tu plataforma, a tu ritmo'));
  titleRow.append(titles,element('p','','Los módulos que manejan datos personales se habilitarán con permisos individuales.'));
  section.append(titleRow);
  const grid=element('div','np-tools-grid');
  const order=['mis-clases','nostrachat','mis-asistencias','mis-notas','mis-pagos','mi-matricula','mis-materiales','mi-progreso','mis-comunicados','soporte'];
  order.forEach(id=>{
    const module=portalSections.find(item=>item.id===id);
    if(module)grid.append(toolCard(module));
  });
  section.append(grid);
  root.append(section);

  const lab=element('section','np-section np-lab-section');
  lab.id='nostralab';
  const labHead=element('div','np-section-title');
  const labTitles=element('div');
  labTitles.append(label('EXPERIMENTA Y DESCUBRE'),element('h2','','NostraLAB'));
  const labRight=element('div','np-lab-actions');
  labRight.append(element('p','np-lab-status','Cargando experiencias aprobadas...'),link('Ver todos los laboratorios','nostralab/','np-button np-button-dark'));
  labHead.append(labTitles,labRight);
  lab.append(labHead);
  const labGrid=element('div','np-lab-grid');
  labGrid.append(element('p','np-empty','Cargando laboratorios publicados...'));
  lab.append(labGrid);
  root.append(lab);

  const privacy=element('aside','np-privacy');
  privacy.append(element('span','np-privacy-icon','🔒'));
  const privacyText=element('div');
  privacyText.append(element('h3','','Tus datos académicos son privados'),
    element('p','','Notas, asistencia, matrícula y pagos se mostrarán únicamente cuando Coordinación vincule tu cuenta con tu ficha oficial. No se comparten datos de otros alumnos.'));
  privacy.append(privacyText);
  root.append(privacy);
  loadLabs(labGrid,$('nostraportal-body').querySelector('.np-lab-status'),$('np-labs-counter'));
  return true;
}

export function clearNostraPortal(){
  const root=$('nostraportal-body');
  if(root)root.replaceChildren();
}
