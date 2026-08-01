(function () {
  'use strict';

  const WHATSAPP_NUMBER = '51993750351';
  const teachers = [];

  const elements = {
    heroSearch: document.getElementById('heroSearch'),
    heroSubject: document.getElementById('heroSubject'),
    heroLevel: document.getElementById('heroLevel'),
    heroModality: document.getElementById('heroModality'),
    requestModal: document.getElementById('requestModal'),
    applyModal: document.getElementById('applyModal'),
    requestForm: document.getElementById('requestForm'),
    applyForm: document.getElementById('applyForm'),
    requestTeacher: document.getElementById('requestTeacher'),
    requestSubject: document.getElementById('requestSubject'),
    teacherGrid: document.getElementById('teacherGrid'),
    resultsCount: document.getElementById('resultsCount'),
    toast: document.getElementById('toast'),
    menuToggle: document.getElementById('menuToggle'),
    mainNav: document.getElementById('mainNav')
  };

  function showEmptyDirectory() {
    const section = document.getElementById('profesores');
    if (!section) return;

    section.classList.add('np-marketplace--empty');
    section.innerHTML = [
      '<div class="np-container">',
        '<div class="np-section-heading np-section-heading--center">',
          '<span class="np-kicker">Directorio NostraProfe</span>',
          '<h2 id="teachersTitle">Aún no hay profesores disponibles para contratar</h2>',
          '<p>Los primeros perfiles se publicarán únicamente después de superar la validación documental, la evaluación académica y la clase demostrativa supervisada por el Comité Académico NostraProfe.</p>',
        '</div>',
        '<div class="np-directory-status" role="status" aria-live="polite">',
          '<div class="np-directory-status__icon"><i class="fa-solid fa-user-shield"></i></div>',
          '<span class="np-directory-status__badge"><i class="fa-solid fa-spinner"></i> Evaluación de postulantes en curso</span>',
          '<h3>Estamos seleccionando a los primeros docentes NostraProfe</h3>',
          '<p>No mostraremos perfiles provisionales ni integrantes del Comité Académico como profesores disponibles. Cada docente deberá demostrar su experiencia, dominio del curso y capacidad real para enseñar antes de ingresar al directorio.</p>',
          '<div class="np-directory-status__steps" aria-label="Proceso previo a la publicación">',
            '<div><strong>01</strong><span>Verificación de identidad y experiencia</span></div>',
            '<div><strong>02</strong><span>Evaluación académica por especialidad</span></div>',
            '<div><strong>03</strong><span>Clase demostrativa y aprobación</span></div>',
          '</div>',
          '<div class="np-directory-status__actions">',
            '<button class="np-btn" type="button" data-open-request>Solicitar un profesor</button>',
            '<button class="np-outline-btn" type="button" data-open-apply>Postular como docente</button>',
          '</div>',
          '<small><i class="fa-solid fa-shield-check"></i> El Comité Académico es exclusivamente evaluador y no forma parte del directorio de profesores disponibles.</small>',
        '</div>',
      '</div>'
    ].join('');

    if (!document.getElementById('np-empty-directory-styles')) {
      const style = document.createElement('style');
      style.id = 'np-empty-directory-styles';
      style.textContent = [
        '.np-marketplace--empty{background:radial-gradient(circle at 15% 20%,rgba(15,175,194,.10),transparent 34%),radial-gradient(circle at 85% 80%,rgba(244,183,42,.10),transparent 30%),#f7fbfc}',
        '.np-directory-status{width:min(900px,100%);margin:42px auto 0;padding:clamp(30px,5vw,58px);border:1px solid rgba(7,88,97,.14);border-radius:28px;background:rgba(255,255,255,.96);box-shadow:0 24px 70px rgba(3,31,38,.10);text-align:center;position:relative;overflow:hidden}',
        '.np-directory-status:before{content:"";position:absolute;inset:0 0 auto;height:5px;background:linear-gradient(90deg,#075861,#0fafc2,#f4b72a)}',
        '.np-directory-status__icon{width:86px;height:86px;margin:0 auto 18px;display:grid;place-items:center;border-radius:24px;color:#fff;background:linear-gradient(145deg,#075861,#0fafc2);box-shadow:0 16px 34px rgba(15,175,194,.24);font-size:34px}',
        '.np-directory-status__badge{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;color:#075861;background:rgba(15,175,194,.11);font-size:13px;font-weight:800;letter-spacing:.02em;text-transform:uppercase}',
        '.np-directory-status__badge i{animation:np-directory-spin 2.4s linear infinite}',
        '.np-directory-status h3{max-width:670px;margin:20px auto 12px;color:#031f26;font-size:clamp(27px,4vw,42px);line-height:1.12}',
        '.np-directory-status>p{max-width:740px;margin:0 auto;color:#52666b;font-size:17px;line-height:1.75}',
        '.np-directory-status__steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:34px 0;text-align:left}',
        '.np-directory-status__steps div{min-height:112px;padding:20px;border:1px solid rgba(7,88,97,.11);border-radius:18px;background:#f8fcfd}',
        '.np-directory-status__steps strong{display:block;margin-bottom:8px;color:#0fafc2;font-size:24px;font-weight:900}',
        '.np-directory-status__steps span{color:#28474e;font-size:14px;font-weight:750;line-height:1.45}',
        '.np-directory-status__actions{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin-top:6px}',
        '.np-directory-status__actions .np-outline-btn{background:#fff;cursor:pointer}',
        '.np-directory-status>small{display:block;max-width:690px;margin:24px auto 0;color:#6a7e83;font-size:13px;line-height:1.55}',
        '.np-directory-status>small i{margin-right:5px;color:#0fafc2}',
        '@keyframes np-directory-spin{to{transform:rotate(360deg)}}',
        '@media(max-width:760px){.np-directory-status{margin-top:28px;border-radius:22px}.np-directory-status__steps{grid-template-columns:1fr}.np-directory-status__steps div{min-height:0}.np-directory-status__actions{flex-direction:column}.np-directory-status__actions .np-btn,.np-directory-status__actions .np-outline-btn{width:100%}}',
        '@media(prefers-reduced-motion:reduce){.np-directory-status__badge i{animation:none}}'
      ].join('');
      document.head.appendChild(style);
    }
  }

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      elements.toast.classList.remove('is-visible');
    }, 3200);
  }

  function openModal(modal) {
    if (!modal) return;
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
    document.body.classList.add('np-modal-open');
  }

  function closeModal(modal) {
    if (!modal) return;
    if (typeof modal.close === 'function') {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
    document.body.classList.remove('np-modal-open');
  }

  function setSelectValue(select, preferredValues) {
    if (!select) return;
    const available = Array.from(select.options).map(function (option) { return option.value; });
    const selected = preferredValues.find(function (value) { return available.includes(value); });
    if (selected) select.value = selected;
  }

  function openRequest(prefill) {
    const data = prefill || {};
    if (!elements.requestForm) return;

    elements.requestForm.reset();
    if (elements.requestTeacher) elements.requestTeacher.value = '';
    if (elements.requestSubject) elements.requestSubject.value = data.subject || '';

    const levelSelect = elements.requestForm.querySelector('[name="level"]');
    const modalitySelect = elements.requestForm.querySelector('[name="modality"]');

    if (data.level === 'UNI') {
      setSelectValue(levelSelect, ['Preparación UNI']);
    } else if (data.level === 'Escolar') {
      setSelectValue(levelSelect, ['Secundaria', 'Primaria']);
    } else if (data.level === 'Preuniversitario') {
      setSelectValue(levelSelect, ['Preuniversitario']);
    }

    if (data.modality) {
      setSelectValue(modalitySelect, [data.modality, 'Indistinto']);
    }

    openModal(elements.requestModal);
  }

  function encodeWhatsAppMessage(lines) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.filter(Boolean).join('\n'));
  }

  function formDataObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function trackEvent(name, parameters) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, Object.assign({
      page_name: 'nostraprofe',
      page_path: window.location.pathname
    }, parameters || {}));
  }

  function handleRequestSubmit(event) {
    event.preventDefault();
    const data = formDataObject(event.currentTarget);
    const url = encodeWhatsAppMessage([
      'Hola NostraProfe, deseo solicitar un profesor.',
      '',
      'Nombre: ' + data.name,
      'Celular: ' + data.phone,
      'Curso: ' + data.subject,
      'Nivel: ' + data.level,
      'Modalidad: ' + data.modality,
      'Distrito o ciudad: ' + (data.location || 'No indicado'),
      'Objetivo o dificultad: ' + data.goal,
      '',
      'Entiendo que el directorio aún se encuentra en proceso de evaluación y autorizo al equipo NostraProfe a contactarme cuando exista un perfil aprobado compatible.'
    ]);

    trackEvent('nostraprofe_solicitud_sin_perfil', {
      event_category: 'lead',
      subject: data.subject,
      modality: data.modality
    });

    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Solicitud preparada. Continúa el envío en WhatsApp.');
    closeModal(elements.requestModal);
  }

  function handleApplySubmit(event) {
    event.preventDefault();
    const data = formDataObject(event.currentTarget);
    const url = encodeWhatsAppMessage([
      'Hola NostraProfe, deseo postular como profesor.',
      '',
      'Nombre: ' + data.name,
      'Celular: ' + data.phone,
      'Correo: ' + data.email,
      'Curso principal: ' + data.subject,
      'Nivel que enseña: ' + data.level,
      'Experiencia: ' + data.experience + ' año(s)',
      'Modalidad: ' + data.modality,
      'Distrito o ciudad: ' + data.location,
      'Resumen profesional: ' + data.summary,
      '',
      'Acepto participar en el proceso de evaluación NostraProfe antes de que mi perfil pueda ser publicado.'
    ]);

    trackEvent('nostraprofe_postulacion', {
      event_category: 'teacher_lead',
      subject: data.subject,
      modality: data.modality
    });

    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Postulación preparada. Continúa el envío en WhatsApp.');
    closeModal(elements.applyModal);
  }

  function closeMobileMenu() {
    if (!elements.menuToggle || !elements.mainNav) return;
    elements.menuToggle.classList.remove('is-active');
    elements.mainNav.classList.remove('is-open');
    elements.menuToggle.setAttribute('aria-expanded', 'false');
  }

  function bindModalBackdrop(modal) {
    if (!modal) return;
    modal.addEventListener('click', function (event) {
      const rect = modal.getBoundingClientRect();
      const isBackdrop = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (isBackdrop) closeModal(modal);
    });
    modal.addEventListener('close', function () {
      document.body.classList.remove('np-modal-open');
    });
  }

  function bindEvents() {
    if (elements.heroSearch) {
      elements.heroSearch.addEventListener('submit', function (event) {
        event.preventDefault();
        const subject = elements.heroSubject ? elements.heroSubject.value.trim() : '';
        const level = elements.heroLevel ? elements.heroLevel.value : '';
        const modalityValue = elements.heroModality ? elements.heroModality.value : '';
        const modality = modalityValue === 'todas' ? '' : modalityValue;

        trackEvent('nostraprofe_busqueda_sin_perfiles', {
          event_category: 'engagement',
          subject: subject || 'no_indicado',
          level: level || 'no_indicado',
          modality: modality || 'indistinto'
        });

        openRequest({ subject: subject, level: level, modality: modality });
      });
    }

    document.addEventListener('click', function (event) {
      const subjectButton = event.target.closest('[data-subject]');
      if (subjectButton) {
        const subject = subjectButton.getAttribute('data-subject') || '';
        if (elements.heroSubject) elements.heroSubject.value = subject;
        openRequest({ subject: subject });
        return;
      }

      if (event.target.closest('[data-open-request]')) {
        openRequest({});
        return;
      }

      if (event.target.closest('[data-open-apply]')) {
        openModal(elements.applyModal);
        return;
      }

      const closeButton = event.target.closest('[data-close-modal]');
      if (closeButton) {
        closeModal(closeButton.closest('dialog'));
      }
    });

    bindModalBackdrop(elements.requestModal);
    bindModalBackdrop(elements.applyModal);

    if (elements.requestForm) elements.requestForm.addEventListener('submit', handleRequestSubmit);
    if (elements.applyForm) elements.applyForm.addEventListener('submit', handleApplySubmit);

    if (elements.menuToggle && elements.mainNav) {
      elements.menuToggle.addEventListener('click', function () {
        const isOpen = elements.mainNav.classList.toggle('is-open');
        elements.menuToggle.classList.toggle('is-active', isOpen);
        elements.menuToggle.setAttribute('aria-expanded', String(isOpen));
      });

      elements.mainNav.addEventListener('click', function (event) {
        if (event.target.closest('a, button')) closeMobileMenu();
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 920) closeMobileMenu();
      });
    }
  }

  const year = document.getElementById('currentYear');
  if (year) year.textContent = String(new Date().getFullYear());

  showEmptyDirectory();
  bindEvents();
})();
