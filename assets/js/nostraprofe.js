(function () {
  'use strict';

  const WHATSAPP_NUMBER = '51993750351';

  const teachers = [
    {
      id: 'luis-nizama',
      name: 'Prof. Luis Nizama',
      subject: 'Aritmética',
      specialties: ['Aritmética', 'Preparación UNI', 'Reforzamiento'],
      levels: ['Escolar', 'Preuniversitario', 'UNI'],
      modalities: ['Presencial', 'Virtual'],
      image: '../assets/img/docentes/aritmetica-nizama-327x250.jpg',
      description: 'Docente del Grupo Nostradamus con experiencia en formación matemática y resolución de problemas.'
    },
    {
      id: 'eddy-huamani',
      name: 'Prof. Eddy Huamani',
      subject: 'Aritmética',
      specialties: ['Aritmética', 'Razonamiento numérico', 'Preparación UNI'],
      levels: ['Escolar', 'Preuniversitario', 'UNI'],
      modalities: ['Presencial', 'Virtual'],
      image: '../assets/img/docentes/aritmetica-huamani-327x250.jpg',
      description: 'Especialista en contenidos aritméticos y entrenamiento orientado al rendimiento preuniversitario.'
    },
    {
      id: 'luis-manrique',
      name: 'Prof. Luis Manrique',
      subject: 'Álgebra',
      specialties: ['Álgebra', 'Ecuaciones', 'Funciones'],
      levels: ['Escolar', 'Preuniversitario', 'UNI'],
      modalities: ['Presencial', 'Virtual'],
      image: '../assets/img/docentes/algebra-manrique-327x250.jpg',
      description: 'Docente del Grupo Nostradamus enfocado en comprensión conceptual, técnica y práctica intensiva.'
    },
    {
      id: 'ruben-quispe',
      name: 'Prof. Rubén Quispe',
      subject: 'Álgebra',
      specialties: ['Álgebra', 'Polinomios', 'Preparación UNI'],
      levels: ['Preuniversitario', 'UNI'],
      modalities: ['Presencial', 'Virtual'],
      image: '../assets/img/docentes/algebra-quispe-327x250.jpg',
      description: 'Especialista en álgebra preuniversitaria y desarrollo de estrategias para problemas de admisión.'
    },
    {
      id: 'cesar-trucios',
      name: 'Prof. César Trucios',
      subject: 'Geometría',
      specialties: ['Geometría', 'Planimetría', 'Preparación UNI'],
      levels: ['Escolar', 'Preuniversitario', 'UNI'],
      modalities: ['Presencial', 'Virtual'],
      image: '../assets/img/docentes/geometria-trucios-327x250.jpg',
      description: 'Docente del Grupo Nostradamus especializado en visualización geométrica y resolución estructurada.'
    },
    {
      id: 'ruben-huillca',
      name: 'Prof. Rubén Huillca',
      subject: 'Trigonometría',
      specialties: ['Trigonometría', 'Geometría analítica', 'Preparación UNI'],
      levels: ['Preuniversitario', 'UNI'],
      modalities: ['Presencial', 'Virtual'],
      image: '../assets/img/docentes/trigonometria-huillca-327x250.jpg',
      description: 'Especialista en trigonometría y entrenamiento de alto nivel para exámenes de admisión.'
    },
    {
      id: 'daniel-villavicencio',
      name: 'Prof. Daniel Villavicencio',
      subject: 'Física',
      specialties: ['Física', 'Matemática', 'Preparación UNI'],
      levels: ['Escolar', 'Preuniversitario', 'UNI'],
      modalities: ['Presencial', 'Virtual'],
      image: '../assets/img/docentes/fisica-daniel-327x250.jpg',
      description: 'Docente de Física del Grupo Nostradamus orientado a la comprensión, el método y la aplicación.'
    },
    {
      id: 'miguel-zavala',
      name: 'Prof. Miguel Zavala',
      subject: 'Química',
      specialties: ['Química', 'Química general', 'Preparación UNI'],
      levels: ['Escolar', 'Preuniversitario', 'UNI'],
      modalities: ['Presencial', 'Virtual'],
      image: '../assets/img/docentes/quimica-zavala-327x250.jpg',
      description: 'Especialista en química escolar y preuniversitaria con enfoque en teoría, práctica y examen UNI.'
    }
  ];

  const elements = {
    grid: document.getElementById('teacherGrid'),
    count: document.getElementById('resultsCount'),
    empty: document.getElementById('emptyState'),
    filterSubject: document.getElementById('filterSubject'),
    filterLevel: document.getElementById('filterLevel'),
    sort: document.getElementById('sortTeachers'),
    clear: document.getElementById('clearFilters'),
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
    toast: document.getElementById('toast'),
    menuToggle: document.getElementById('menuToggle'),
    mainNav: document.getElementById('mainNav')
  };

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getSelectedModalities() {
    return Array.from(document.querySelectorAll('input[name="modalityFilter"]:checked')).map(function (input) {
      return input.value;
    });
  }

  function teacherMatches(teacher, query, level, modalities) {
    const searchable = normalize([
      teacher.name,
      teacher.subject,
      teacher.specialties.join(' '),
      teacher.levels.join(' ')
    ].join(' '));

    const queryMatches = !query || searchable.includes(normalize(query));
    const levelMatches = level === 'todos' || teacher.levels.includes(level);
    const modalityMatches = modalities.length === 0 || modalities.every(function (modality) {
      return teacher.modalities.includes(modality);
    });

    return queryMatches && levelMatches && modalityMatches;
  }

  function sortTeachers(list, mode) {
    const sorted = list.slice();
    if (mode === 'name') {
      sorted.sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
    }
    if (mode === 'subject') {
      sorted.sort(function (a, b) {
        return a.subject.localeCompare(b.subject, 'es') || a.name.localeCompare(b.name, 'es');
      });
    }
    return sorted;
  }

  function teacherCard(teacher) {
    const tags = teacher.specialties.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');

    return [
      '<article class="np-teacher-card">',
        '<div class="np-teacher-card__photo">',
          '<img src="' + escapeHTML(teacher.image) + '" alt="' + escapeHTML(teacher.name + ', profesor de ' + teacher.subject) + '" loading="lazy">',
          '<span class="np-teacher-card__badge"><i class="fa-solid fa-circle-check"></i> Perfil institucional</span>',
        '</div>',
        '<div class="np-teacher-card__body">',
          '<span class="np-teacher-card__subject">' + escapeHTML(teacher.subject) + '</span>',
          '<h3>' + escapeHTML(teacher.name) + '</h3>',
          '<p class="np-teacher-card__description">' + escapeHTML(teacher.description) + '</p>',
          '<div class="np-teacher-card__tags">' + tags + '</div>',
          '<div class="np-teacher-card__meta">',
            '<span><i class="fa-solid fa-graduation-cap"></i> ' + escapeHTML(teacher.levels.join(' · ')) + '</span>',
            '<span><i class="fa-solid fa-video"></i> ' + escapeHTML(teacher.modalities.join(' y ')) + '</span>',
            '<span><i class="fa-solid fa-shield-check"></i> Evaluación académica interna</span>',
          '</div>',
          '<div class="np-teacher-card__action">',
            '<small>Tarifa y disponibilidad<br>a coordinar</small>',
            '<button type="button" data-teacher-id="' + escapeHTML(teacher.id) + '">Solicitar clase</button>',
          '</div>',
        '</div>',
      '</article>'
    ].join('');
  }

  function renderTeachers() {
    const query = elements.filterSubject.value;
    const level = elements.filterLevel.value;
    const modalities = getSelectedModalities();
    const mode = elements.sort.value;

    const filtered = teachers.filter(function (teacher) {
      return teacherMatches(teacher, query, level, modalities);
    });

    const sorted = sortTeachers(filtered, mode);
    elements.grid.innerHTML = sorted.map(teacherCard).join('');
    elements.count.textContent = String(sorted.length);
    elements.empty.hidden = sorted.length !== 0;
    elements.grid.hidden = sorted.length === 0;
  }

  function applyPreset(subject, options) {
    const settings = options || {};
    elements.filterSubject.value = subject || '';
    elements.filterLevel.value = settings.level || 'todos';

    document.querySelectorAll('input[name="modalityFilter"]').forEach(function (input) {
      input.checked = Boolean(settings.modality && input.value === settings.modality);
    });

    renderTeachers();
    document.getElementById('profesores').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  function openRequest(teacher) {
    elements.requestForm.reset();
    elements.requestTeacher.value = teacher ? teacher.name : '';
    elements.requestSubject.value = teacher ? teacher.subject : '';
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
      'Profesor de interés: ' + (data.teacher || 'Búsqueda personalizada'),
      'Nombre: ' + data.name,
      'Celular: ' + data.phone,
      'Curso: ' + data.subject,
      'Nivel: ' + data.level,
      'Modalidad: ' + data.modality,
      'Distrito o ciudad: ' + (data.location || 'No indicado'),
      'Objetivo o dificultad: ' + data.goal,
      '',
      'Acepto ser contactado por el equipo NostraProfe.'
    ]);

    trackEvent('nostraprofe_solicitud', {
      event_category: 'lead',
      subject: data.subject,
      modality: data.modality,
      teacher: data.teacher || 'personalizada'
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
      'Acepto participar en el proceso de evaluación NostraProfe.'
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
    elements.menuToggle.classList.remove('is-active');
    elements.mainNav.classList.remove('is-open');
    elements.menuToggle.setAttribute('aria-expanded', 'false');
  }

  function bindEvents() {
    [elements.filterSubject, elements.filterLevel, elements.sort].forEach(function (element) {
      element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', renderTeachers);
    });

    document.querySelectorAll('input[name="modalityFilter"]').forEach(function (input) {
      input.addEventListener('change', renderTeachers);
    });

    elements.clear.addEventListener('click', function () {
      elements.filterSubject.value = '';
      elements.filterLevel.value = 'todos';
      elements.sort.value = 'recommended';
      document.querySelectorAll('input[name="modalityFilter"]').forEach(function (input) {
        input.checked = false;
      });
      renderTeachers();
    });

    elements.heroSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      const subject = elements.heroSubject.value;
      const level = elements.heroLevel.value;
      const modality = elements.heroModality.value === 'todas' ? '' : elements.heroModality.value;
      applyPreset(subject, { level: level, modality: modality });
      trackEvent('nostraprofe_busqueda', {
        event_category: 'engagement',
        subject: subject || 'todos',
        level: level,
        modality: modality || 'todas'
      });
    });

    document.addEventListener('click', function (event) {
      const subjectButton = event.target.closest('[data-subject]');
      if (subjectButton) {
        const subject = subjectButton.getAttribute('data-subject') || '';
        elements.heroSubject.value = subject;
        applyPreset(subject);
        return;
      }

      const teacherButton = event.target.closest('[data-teacher-id]');
      if (teacherButton) {
        const teacher = teachers.find(function (item) { return item.id === teacherButton.getAttribute('data-teacher-id'); });
        openRequest(teacher || null);
        return;
      }

      if (event.target.closest('[data-open-request]')) {
        openRequest(null);
        return;
      }

      if (event.target.closest('[data-open-apply]')) {
        openModal(elements.applyModal);
        return;
      }

      if (event.target.closest('[data-close-modal]')) {
        closeModal(event.target.closest('dialog'));
      }
    });

    [elements.requestModal, elements.applyModal].forEach(function (modal) {
      modal.addEventListener('click', function (event) {
        const rect = modal.getBoundingClientRect();
        const isBackdrop = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        if (isBackdrop) closeModal(modal);
      });
      modal.addEventListener('close', function () {
        document.body.classList.remove('np-modal-open');
      });
    });

    elements.requestForm.addEventListener('submit', handleRequestSubmit);
    elements.applyForm.addEventListener('submit', handleApplySubmit);

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

  document.getElementById('currentYear').textContent = String(new Date().getFullYear());
  renderTeachers();
  bindEvents();
})();
