from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def write(rel, text):
    (ROOT / rel).write_text(text, encoding="utf-8")


def replace_once(rel, old, new):
    text = read(rel)
    if new in text:
        return False
    if old not in text:
        raise RuntimeError(f"No se encontró el ancla en {rel}: {old[:120]!r}")
    text = text.replace(old, new, 1)
    write(rel, text)
    return True


def add_after(rel, anchor, addition, marker):
    text = read(rel)
    if marker in text:
        return False
    if anchor not in text:
        raise RuntimeError(f"No se encontró el ancla en {rel}: {anchor[:120]!r}")
    text = text.replace(anchor, anchor + addition, 1)
    write(rel, text)
    return True


def academic_line_js(indent=""):
    return (
        f"{indent}function academicLine(programId){{\n"
        f"{indent}  if(programId === 'ciclo-ien' || programId === 'proyecto-escolar') return 'Preparación Escolar';\n"
        f"{indent}  if(programId === 'paralelo-cepre-uni' || programId === 'ciclo-verano-uni' || programId === 'nostra-weekend-uni') return 'Programas Complementarios UNI';\n"
        f"{indent}  return 'Nostra UNI Premium';\n"
        f"{indent}}}\n"
    )


# 1) Tarifario central: producto + planes base desactivados, sin precios inventados.
replace_once(
    "assets/js/admin-tarifario.js",
    "  {id:'ciclo-verano-uni',nombre:'Ciclo Verano UNI',ruta:'ciclo-verano-uni.html',orden:9,descripcion:'Programa intensivo de vacaciones para avanzar y fortalecer bases.'}\n];",
    "  {id:'ciclo-verano-uni',nombre:'Ciclo Verano UNI',ruta:'ciclo-verano-uni.html',orden:9,descripcion:'Programa intensivo de vacaciones para avanzar y fortalecer bases.'},\n"
    "  {id:'nostra-weekend-uni',nombre:'NostraWEEKEND',ruta:'ciclo-weekend-uni.html',orden:10,descripcion:'Programa complementario UNI concentrado en el fin de semana, con opciones Sabatino y Dominical.'}\n];"
)

add_after(
    "assets/js/admin-tarifario.js",
    "const AFTERNOON_SCHEDULE = ['Lunes a Sábado','2:00 p.m. a 7:00 p.m.'];\n",
    "\nconst WEEKEND_DEFAULT_PLANS = [\n"
    "  {id:'sabatino',nombre:'Sabatino',activo:false,destacado:true,tipoCobro:'mensual',precio:0,matricula:0,horarioLineas:['Sábados','Horario por confirmar'],beneficios:['Docentes especialistas UNI','Clases grabadas','Prácticas tipo UNI','Simulacros UNI','Seguimiento académico'],promocionActiva:false,precioPromocional:0,promocionHasta:''},\n"
    "  {id:'dominical',nombre:'Dominical',activo:false,destacado:false,tipoCobro:'mensual',precio:0,matricula:0,horarioLineas:['Domingos','Horario por confirmar'],beneficios:['Docentes especialistas UNI','Clases grabadas','Prácticas tipo UNI','Simulacros UNI','Seguimiento académico'],promocionActiva:false,precioPromocional:0,promocionHasta:''}\n"
    "];\n",
    "WEEKEND_DEFAULT_PLANS"
)

replace_once(
    "assets/js/admin-tarifario.js",
    "  if(normalized.includes('full') || normalized.includes('unico')) return [...FULL_SCHEDULE];\n  if(normalized.includes('tarde')) return [...AFTERNOON_SCHEDULE];\n  if(normalized.includes('manana')) return [...MORNING_SCHEDULE];",
    "  if(normalized.includes('sabatino') || normalized.includes('sabado')) return ['Sábados','Horario por confirmar'];\n  if(normalized.includes('dominical') || normalized.includes('domingo')) return ['Domingos','Horario por confirmar'];\n  if(normalized.includes('full') || normalized.includes('unico')) return [...FULL_SCHEDULE];\n  if(normalized.includes('tarde')) return [...AFTERNOON_SCHEDULE];\n  if(normalized.includes('manana')) return [...MORNING_SCHEDULE];"
)

replace_once(
    "assets/js/admin-tarifario.js",
    "    let planes = Array.isArray(remote.planes) ? remote.planes.map(normalizePlan) : legacyPlan(remote);\n    if(!planes.length) planes = await scrapePlans(program);",
    "    let planes = Array.isArray(remote.planes) ? remote.planes.map(normalizePlan) : legacyPlan(remote);\n    if(!planes.length && program.id === 'nostra-weekend-uni') planes = WEEKEND_DEFAULT_PLANS.map(normalizePlan);\n    if(!planes.length) planes = await scrapePlans(program);"
)

# 2) Configuración ampliada Culqi: reconocer los turnos de fin de semana.
replace_once(
    "assets/js/admin-tarifario-culqi.js",
    "  if(value.includes('manana')) return 'Mañana';\n  if(value.includes('tarde')) return 'Tarde';\n  if(value.includes('noche')) return 'Noche';",
    "  if(value.includes('sabatino') || value.includes('sabado')) return 'Sabatino';\n  if(value.includes('dominical') || value.includes('domingo')) return 'Dominical';\n  if(value.includes('manana')) return 'Mañana';\n  if(value.includes('tarde')) return 'Tarde';\n  if(value.includes('noche')) return 'Noche';"
)

# 3) Formulario: catálogo, turnos y clasificación académica correcta.
replace_once(
    "assets/js/preinscripcion-firebase.js",
    "    {id:'ciclo-verano-uni',name:'Ciclo Verano UNI'}\n  ];",
    "    {id:'ciclo-verano-uni',name:'Ciclo Verano UNI'},\n    {id:'nostra-weekend-uni',name:'NostraWEEKEND'}\n  ];"
)
replace_once(
    "assets/js/preinscripcion-firebase.js",
    "    if(name.indexOf('manana') !== -1) return 'Mañana';\n    if(name.indexOf('tarde') !== -1) return 'Tarde';\n    if(name.indexOf('noche') !== -1) return 'Noche';",
    "    if(name.indexOf('sabatino') !== -1 || name.indexOf('sabado') !== -1) return 'Sabatino';\n    if(name.indexOf('dominical') !== -1 || name.indexOf('domingo') !== -1) return 'Dominical';\n    if(name.indexOf('manana') !== -1) return 'Mañana';\n    if(name.indexOf('tarde') !== -1) return 'Tarde';\n    if(name.indexOf('noche') !== -1) return 'Noche';"
)
add_after(
    "assets/js/preinscripcion-firebase.js",
    "  function normalized(value){\n    return clean(value).toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');\n  }\n",
    academic_line_js("  "),
    "function academicLine(programId)"
)
replace_once(
    "assets/js/preinscripcion-firebase.js",
    "      lineaAcademica:'Nostra UNI Premium',",
    "      lineaAcademica:academicLine(program ? program.id : value('ciclo'))," 
)

# 4) Checkout Culqi: turnos y línea académica.
replace_once(
    "assets/js/preinscripcion-culqi-preparacion.js",
    "    if(value.indexOf('manana') !== -1) return 'Mañana';\n    if(value.indexOf('tarde') !== -1) return 'Tarde';\n    if(value.indexOf('noche') !== -1) return 'Noche';",
    "    if(value.indexOf('sabatino') !== -1 || value.indexOf('sabado') !== -1) return 'Sabatino';\n    if(value.indexOf('dominical') !== -1 || value.indexOf('domingo') !== -1) return 'Dominical';\n    if(value.indexOf('manana') !== -1) return 'Mañana';\n    if(value.indexOf('tarde') !== -1) return 'Tarde';\n    if(value.indexOf('noche') !== -1) return 'Noche';"
)
add_after(
    "assets/js/preinscripcion-culqi-preparacion.js",
    "  function selectedPaymentMethod(form){ return formValue(form,'metodoPagoPreferido'); }\n",
    academic_line_js("  "),
    "function academicLine(programId)"
)
replace_once(
    "assets/js/preinscripcion-culqi-preparacion.js",
    "      lineaAcademica:'Nostra UNI Premium',",
    "      lineaAcademica:academicLine(official.program.id),"
)

# 5) Registro manual de alumnos.
replace_once(
    "assets/js/admin-alumnos-manuales.js",
    "  ['ciclo-verano-uni','Ciclo Verano UNI']\n];",
    "  ['ciclo-verano-uni','Ciclo Verano UNI'],\n  ['nostra-weekend-uni','NostraWEEKEND']\n];"
)
replace_once(
    "assets/js/admin-alumnos-manuales.js",
    "<option>Mañana</option><option>Tarde</option><option>Noche</option><option>FULL</option>",
    "<option>Mañana</option><option>Tarde</option><option>Noche</option><option>FULL</option><option>Sabatino</option><option>Dominical</option>"
)
add_after(
    "assets/js/admin-alumnos-manuales.js",
    "function programName(id){\n  return PROGRAMS.find(item => item[0] === id)?.[1] || id;\n}\n",
    "\nfunction academicLine(programId){\n  if(programId === 'ciclo-ien' || programId === 'proyecto-escolar') return 'Preparación Escolar';\n  if(programId === 'paralelo-cepre-uni' || programId === 'ciclo-verano-uni' || programId === 'nostra-weekend-uni') return 'Programas Complementarios UNI';\n  return 'Nostra UNI Premium';\n}\n",
    "function academicLine(programId)"
)
replace_once(
    "assets/js/admin-alumnos-manuales.js",
    "      lineaAcademica:'Nostra UNI Premium',",
    "      lineaAcademica:academicLine(programaId),"
)

# 6) Tarifario público de cada ciclo.
replace_once(
    "assets/js/nostra-cycle-pricing.js",
    "    'ciclo-verano-uni.html':{id:'ciclo-verano-uni',name:'Ciclo Verano UNI'}\n  };",
    "    'ciclo-verano-uni.html':{id:'ciclo-verano-uni',name:'Ciclo Verano UNI'},\n    'ciclo-weekend-uni.html':{id:'nostra-weekend-uni',name:'NostraWEEKEND'}\n  };"
)
replace_once(
    "assets/js/nostra-cycle-pricing.js",
    "    if(normalized.indexOf('full') !== -1 || normalized.indexOf('unico') !== -1) return FULL_SCHEDULE.slice();\n    if(normalized.indexOf('tarde') !== -1) return AFTERNOON_SCHEDULE.slice();",
    "    if(normalized.indexOf('sabatino') !== -1 || normalized.indexOf('sabado') !== -1) return ['Sábados','Horario por confirmar'];\n    if(normalized.indexOf('dominical') !== -1 || normalized.indexOf('domingo') !== -1) return ['Domingos','Horario por confirmar'];\n    if(normalized.indexOf('full') !== -1 || normalized.indexOf('unico') !== -1) return FULL_SCHEDULE.slice();\n    if(normalized.indexOf('tarde') !== -1) return AFTERNOON_SCHEDULE.slice();"
)

# 7) Catálogo de ciclos.
replace_once(
    "assets/js/nostra-ciclos-catalog-dynamic.js",
    "    {id:'ciclo-verano-uni',nombre:'Ciclo Verano UNI',ruta:'ciclo-verano-uni.html',grupo:'complementario',orden:9,promesa:'Avanza y fortalece tus bases en vacaciones.',ideal:'Escolares y egresados que desean aprovechar el verano para elevar su nivel académico.',descripcion:'Programa intensivo de vacaciones para reforzar fundamentos y avanzar en la preparación UNI.'}\n  ];",
    "    {id:'ciclo-verano-uni',nombre:'Ciclo Verano UNI',ruta:'ciclo-verano-uni.html',grupo:'complementario',orden:9,promesa:'Avanza y fortalece tus bases en vacaciones.',ideal:'Escolares y egresados que desean aprovechar el verano para elevar su nivel académico.',descripcion:'Programa intensivo de vacaciones para reforzar fundamentos y avanzar en la preparación UNI.'},\n    {id:'nostra-weekend-uni',nombre:'NostraWEEKEND',ruta:'ciclo-weekend-uni.html',grupo:'complementario',orden:10,promesa:'Tu preparación UNI también avanza el fin de semana.',ideal:'Estudiantes que necesitan concentrar su preparación especializada en sábado o domingo.',descripcion:'Programa complementario UNI con opciones Sabatino y Dominical, práctica tipo admisión y seguimiento académico.'}\n  ];"
)

# 8) Navegación visible.
replace_once(
    "assets/js/nostra-ciclos-links.js",
    "    'ciclo verano uni': 'ciclo-verano-uni.html'\n  };",
    "    'ciclo verano uni': 'ciclo-verano-uni.html',\n    'nostraweekend': 'ciclo-weekend-uni.html',\n    'nostra weekend': 'ciclo-weekend-uni.html',\n    'weekend uni': 'ciclo-weekend-uni.html'\n  };"
)
replace_once(
    "assets/js/nostra-cycle-menu-labels.js",
    "    'ciclo-verano-uni.html': 'Ciclo Verano UNI'\n  };",
    "    'ciclo-verano-uni.html': 'Ciclo Verano UNI',\n    'ciclo-weekend-uni.html': 'NostraWEEKEND'\n  };"
)
replace_once(
    "assets/js/shared-header.js",
    "    ['Ciclo Verano UNI', 'ciclo-verano-uni.html']\n  ];",
    "    ['Ciclo Verano UNI', 'ciclo-verano-uni.html'],\n    ['NostraWEEKEND', 'ciclo-weekend-uni.html']\n  ];"
)
replace_once(
    "assets/js/nostra-footer-universal.js",
    "                  '<li><a href=\"ciclo-verano-uni.html\">Ciclo Verano UNI</a></li>' +",
    "                  '<li><a href=\"ciclo-verano-uni.html\">Ciclo Verano UNI</a></li>' +\n                  '<li><a href=\"ciclo-weekend-uni.html\">NostraWEEKEND</a></li>' +"
)
replace_once(
    "assets/js/nostra-cycle-description-meta.js",
    "    'ciclo-verano-uni.html':'ciclo-verano-uni'\n  };",
    "    'ciclo-verano-uni.html':'ciclo-verano-uni',\n    'ciclo-weekend-uni.html':'nostra-weekend-uni'\n  };"
)

# 9) SEO.
replace_once(
    "assets/js/nostra-seo-meta.js",
    "      description: 'Explora los ciclos académicos de Grupo Nostradamus para la preparación UNI: anual, semianual, semestral, repaso, verano, IEN y paralelo CEPRE UNI.'",
    "      description: 'Explora los ciclos académicos de Grupo Nostradamus para la preparación UNI: NostraRUTA, IEN, Proyecto Escolar, Paralelo CEPRE UNI, Verano y NostraWEEKEND.'"
)
replace_once(
    "assets/js/nostra-seo-meta.js",
    "    'clases-en-vivo.html': {",
    "    'ciclo-weekend-uni.html': {\n      title: 'NostraWEEKEND | Preparación UNI sábados y domingos',\n      description: 'NostraWEEKEND de Grupo Nostradamus: programa complementario UNI con opciones Sabatino y Dominical para reforzar tu preparación durante el fin de semana.'\n    },\n    'clases-en-vivo.html': {"
)
replace_once(
    "assets/js/nostra-social-seo.js",
    "      description: 'Conoce nuestros ciclos de preparación UNI: anual, semianual, semestral, élite, repaso, verano, IEN y paralelo CEPRE UNI.',",
    "      description: 'Conoce nuestros programas de preparación UNI: NostraRUTA, IEN, Proyecto Escolar, Paralelo CEPRE UNI, Verano y NostraWEEKEND.',"
)
replace_once(
    "assets/js/nostra-social-seo.js",
    "    'ciclo-repaso-uni.html': {",
    "    'ciclo-weekend-uni.html': {\n      title: 'NostraWEEKEND | Grupo Nostradamus',\n      description: 'Preparación complementaria UNI con opciones Sabatino y Dominical para estudiar durante el fin de semana.',\n      image: BASE + '/assets/img/logo.png'\n    },\n    'ciclo-repaso-uni.html': {"
)
replace_once(
    "assets/js/nostra-schema-jsonld.js",
    "    'ciclo-verano-uni.html': 'Ciclo Verano UNI'\n  };",
    "    'ciclo-verano-uni.html': 'Ciclo Verano UNI',\n    'ciclo-weekend-uni.html': 'NostraWEEKEND'\n  };"
)

# 10) Sitemap.
replace_once(
    "sitemap.xml",
    "  <url><loc>https://gruponostradamus.edu.pe/ciclo-verano-uni.html</loc><lastmod>2026-05-03</lastmod><changefreq>weekly</changefreq><priority>0.88</priority></url>",
    "  <url><loc>https://gruponostradamus.edu.pe/ciclo-verano-uni.html</loc><lastmod>2026-05-03</lastmod><changefreq>weekly</changefreq><priority>0.88</priority></url>\n  <url><loc>https://gruponostradamus.edu.pe/ciclo-weekend-uni.html</loc><lastmod>2026-08-11</lastmod><changefreq>weekly</changefreq><priority>0.88</priority></url>"
)

# 11) Fallback HTML y cachebusters de preinscripción/admin/global.
replace_once(
    "preinscripcion.html",
    "<option>Ciclo Verano UNI</option><option>NostraMÓDULOS</option>",
    "<option>Ciclo Verano UNI</option><option>NostraWEEKEND</option><option>NostraMÓDULOS</option>"
)
replace_once(
    "preinscripcion.html",
    "assets/js/preinscripcion-culqi-preparacion.js?v=2026-08-11-live",
    "assets/js/preinscripcion-culqi-preparacion.js?v=2026-08-11-weekend"
)
replace_once(
    "preinscripcion.html",
    "assets/js/preinscripcion-firebase.js?v=2026-05",
    "assets/js/preinscripcion-firebase.js?v=2026-08-11-weekend"
)
replace_once(
    "admin-preinscripciones.html",
    "assets/js/admin-tarifario.js?v=2026-03",
    "assets/js/admin-tarifario.js?v=2026-08-11-weekend"
)
replace_once(
    "admin-preinscripciones.html",
    "assets/js/admin-tarifario-culqi.js?v=2026-01",
    "assets/js/admin-tarifario-culqi.js?v=2026-08-11-weekend"
)
replace_once(
    "admin-preinscripciones.html",
    "assets/js/admin-alumnos-manuales.js?v=2026-08-11-2",
    "assets/js/admin-alumnos-manuales.js?v=2026-08-11-weekend"
)
replace_once(
    "assets/js/nostra-sitewide-loader.js",
    "var VERSION = '2026-92-address-239';",
    "var VERSION = '2026-08-11-weekend';"
)
replace_once(
    "assets/js/main.js",
    "script.src = 'assets/js/nostra-sitewide-loader.js?v=1';",
    "script.src = 'assets/js/nostra-sitewide-loader.js?v=2026-08-11-weekend';"
)

# 12) Página pública del ciclo. Sin precios/fechas/horas inventados.
page = r'''<!doctype html>
<html class="no-js" lang="es">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>NostraWEEKEND | Grupo Nostradamus</title>
  <meta name="description" content="NostraWEEKEND: preparación complementaria UNI con opciones Sabatino y Dominical para avanzar durante el fin de semana.">
  <meta name="robots" content="INDEX,FOLLOW">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="shortcut icon" href="assets/img/favicons/iocon-ostradamus.png" type="image/x-icon">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Jost:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="assets/css/fontawesome.min.css">
  <link rel="stylesheet" href="assets/css/magnific-popup.min.css">
  <link rel="stylesheet" href="assets/css/slick.min.css">
  <link rel="stylesheet" href="assets/css/nice-select.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    .nw-hero-card{position:relative;overflow:hidden;border-radius:28px;padding:38px;background:radial-gradient(circle at 12% 12%,rgba(39,215,229,.20),transparent 34%),linear-gradient(135deg,#031f26,#063943 58%,#087b8c);color:#fff;box-shadow:0 22px 55px rgba(3,31,38,.18)}
    .nw-hero-card:after{content:"WEEKEND";position:absolute;right:-18px;bottom:-34px;font:800 clamp(58px,10vw,130px)/1 'Baloo 2';color:rgba(255,255,255,.055);letter-spacing:4px;pointer-events:none}
    .nw-kicker{display:inline-flex;padding:7px 12px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(255,255,255,.08);font-size:12px;font-weight:900;letter-spacing:.6px;text-transform:uppercase}
    .nw-hero-card h2{margin:15px 0 10px;color:#fff;font:800 clamp(38px,6vw,68px)/.95 'Baloo 2'}
    .nw-hero-card p{max-width:760px;margin:0;color:rgba(255,255,255,.84);font-size:18px;line-height:1.6}
    .nw-plan-preview{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px}
    .nw-plan-preview article{padding:19px;border:1px solid rgba(255,255,255,.17);border-radius:20px;background:rgba(255,255,255,.08)}
    .nw-plan-preview strong{display:block;color:#58e0e8;font-size:20px}.nw-plan-preview span{color:rgba(255,255,255,.82);font-weight:700}
    .nw-note{margin-top:18px;padding:14px 16px;border-radius:16px;background:#eef8fa;border:1px solid rgba(7,140,149,.18);color:#075b65;font-weight:800;line-height:1.55}
    .nw-price-pending{font-size:22px!important;line-height:1.2!important}.nw-price-pending small{display:block;margin-top:5px;color:#607080;font-size:13px;font-weight:750}
    @media(max-width:720px){.nw-hero-card{padding:27px 22px}.nw-plan-preview{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="preloader"><div class="preloader-inner"><span class="loader"></span></div></div>

  <div class="breadcumb-wrapper" data-bg-src="assets/img/bg/breadcumb-bg.jpg" data-overlay="title" data-opacity="8">
    <div class="container"><div class="breadcumb-content text-center"><h1 class="breadcumb-title">NostraWEEKEND</h1><ul class="breadcumb-menu"><li><a href="index.html">Inicio</a></li><li><a href="ciclos.html">Ciclos</a></li><li>NostraWEEKEND</li></ul></div></div>
  </div>

  <section class="space-top space-extra2-bottom">
    <div class="container">
      <div class="row gy-4">
        <div class="col-xxl-9 col-lg-8">
          <div class="course-single">
            <div class="course-single-top">
              <div class="nw-hero-card">
                <span class="nw-kicker">Programa Complementario UNI</span>
                <h2>NostraWEEKEND</h2>
                <p>Una alternativa para continuar tu preparación UNI durante el fin de semana. Elige la opción Sabatino o Dominical según tu disponibilidad y mantén un entrenamiento académico constante.</p>
                <div class="nw-plan-preview"><article><strong>Sabatino</strong><span>Sábados · horario configurable</span></article><article><strong>Dominical</strong><span>Domingos · horario configurable</span></article></div>
              </div>
              <h2 class="course-title mt-30">NostraWEEKEND</h2>
            </div>

            <div class="course-single-bottom">
              <ul class="nav course-tab" id="courseTab" role="tablist">
                <li class="nav-item"><a class="nav-link active" id="description-tab" data-bs-toggle="tab" href="#Coursedescription" role="tab"><i class="fa-regular fa-bookmark"></i>Descripción</a></li>
                <li class="nav-item"><a class="nav-link" id="curriculam-tab" data-bs-toggle="tab" href="#curriculam" role="tab"><i class="fa-regular fa-book"></i>Beneficios</a></li>
                <li class="nav-item"><a class="nav-link" id="instructor-tab" data-bs-toggle="tab" href="#instructor" role="tab"><i class="fa-regular fa-user"></i>Características</a></li>
              </ul>
              <div class="tab-content" id="productTabContent">
                <div class="tab-pane fade show active" id="Coursedescription" role="tabpanel">
                  <div class="course-description">
                    <h5 class="h5">Descripción</h5>
                    <p>NostraWEEKEND es un programa complementario de preparación para la UNI diseñado para estudiantes que necesitan concentrar su estudio presencial en el fin de semana. No forma parte de NostraRUTA UNI y funciona como una alternativa independiente para reforzar conocimientos, practicar y sostener el ritmo académico.</p>
                  </div>

                </div>
                <div class="tab-pane fade" id="curriculam" role="tabpanel">
                  <div class="course-curriculam"><h5 class="h5">Beneficios</h5><div class="checklist mb-1"><ul>
                    <li>Docentes especialistas en preparación UNI.</li><li>Clases grabadas para reforzar lo desarrollado.</li><li>Práctica académica con enfoque tipo UNI.</li><li>Simulacros y evaluación del progreso.</li><li>Seguimiento académico durante el ciclo.</li>
                  </ul></div></div>
                </div>
                <div class="tab-pane fade" id="instructor" role="tabpanel">
                  <div class="course-curriculam"><h5 class="h5">Características</h5><div class="checklist mb-1"><ul>
                    <li>Dos opciones independientes: Sabatino y Dominical.</li><li>Horario, fecha de inicio y tarifas administrables desde el panel de Grupo Nostradamus.</li><li>Programa complementario e independiente de NostraRUTA UNI.</li><li>Inscripción y pago integrados al mismo sistema de los demás ciclos.</li>
                  </ul></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xxl-3 col-lg-4">
          <aside class="sidebar-area">
            <div class="widget widget_info">
              <span class="h4 course-price">NostraWEEKEND</span>
              <a href="preinscripcion.html?programa=nostra-weekend-uni&programaNombre=NostraWEEKEND" class="th-btn">Preinscribirme</a>
              <a href="https://wa.me/51993750351?text=Hola%20Nostradamus,%20quiero%20informes%20sobre%20NostraWEEKEND." target="_blank" rel="noopener noreferrer" class="th-btn style4">Solicitar informes</a>
              <div class="nw-note">Las fechas, horarios y tarifas oficiales se publican desde el panel administrativo.</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="title-area text-center"><span class="sub-title"><i class="fal fa-book me-1"></i> PRECIOS ACADÉMICOS</span><h2 class="sec-title">Nuestros planes para tu futuro</h2></div>
      <div class="row gy-4 justify-content-center">
        <div class="col-xl-6 col-md-6"><div class="price-card active"><div class="price-card_top"><h3 class="price-card_title">Sabatino</h3><h4 class="price-card_price nw-price-pending">Precio por confirmar<small>Configurable desde el tarifario administrativo</small></h4></div><div class="price-card_content"><div class="checklist"><ul><li><i class="far fa-check-circle"></i> Sábados</li><li><i class="far fa-check-circle"></i> Horario configurable</li><li><i class="far fa-check-circle"></i> Seguimiento académico</li></ul></div><a href="preinscripcion.html?programa=nostra-weekend-uni&programaNombre=NostraWEEKEND&plan=sabatino&planNombre=Sabatino" class="th-btn style10">Elegir Sabatino <i class="fa-regular fa-arrow-right ms-2"></i></a></div></div></div>
        <div class="col-xl-6 col-md-6"><div class="price-card"><div class="price-card_top"><h3 class="price-card_title">Dominical</h3><h4 class="price-card_price nw-price-pending">Precio por confirmar<small>Configurable desde el tarifario administrativo</small></h4></div><div class="price-card_content"><div class="checklist"><ul><li><i class="far fa-check-circle"></i> Domingos</li><li><i class="far fa-check-circle"></i> Horario configurable</li><li><i class="far fa-check-circle"></i> Seguimiento académico</li></ul></div><a href="preinscripcion.html?programa=nostra-weekend-uni&programaNombre=NostraWEEKEND&plan=dominical&planNombre=Dominical" class="th-btn style10">Elegir Dominical <i class="fa-regular fa-arrow-right ms-2"></i></a></div></div></div>
      </div>
    </div>
  </section>

  <div style="height:70px"></div>
  <script src="assets/js/vendor/jquery-3.6.0.min.js"></script>
  <script src="assets/js/slick.min.js"></script>
  <script src="assets/js/bootstrap.min.js"></script>
  <script src="assets/js/jquery.magnific-popup.min.js"></script>
  <script src="assets/js/jquery.counterup.min.js"></script>
  <script src="assets/js/circle-progress.js"></script>
  <script src="assets/js/jquery-ui.min.js"></script>
  <script src="assets/js/imagesloaded.pkgd.min.js"></script>
  <script src="assets/js/isotope.pkgd.min.js"></script>
  <script src="assets/js/tilt.jquery.min.js"></script>
  <script src="assets/js/tweenmax.min.js"></script>
  <script src="assets/js/nice-select.min.js"></script>
  <script src="assets/js/main.js?v=2026-08-11-weekend"></script>
</body>
</html>
'''

weekend_path = ROOT / "ciclo-weekend-uni.html"
if not weekend_path.exists() or weekend_path.read_text(encoding="utf-8") != page:
    weekend_path.write_text(page, encoding="utf-8")

# Validaciones de integración.
checks = {
    "assets/js/admin-tarifario.js": ["nostra-weekend-uni", "WEEKEND_DEFAULT_PLANS", "Sabatino", "Dominical"],
    "assets/js/preinscripcion-firebase.js": ["nostra-weekend-uni", "academicLine", "Sabatino", "Dominical"],
    "assets/js/preinscripcion-culqi-preparacion.js": ["nostra-weekend-uni", "academicLine", "Sabatino", "Dominical"],
    "assets/js/admin-alumnos-manuales.js": ["nostra-weekend-uni", "NostraWEEKEND", "Sabatino", "Dominical"],
    "assets/js/nostra-cycle-pricing.js": ["ciclo-weekend-uni.html", "nostra-weekend-uni"],
    "assets/js/nostra-ciclos-catalog-dynamic.js": ["NostraWEEKEND", "grupo:'complementario'"],
    "sitemap.xml": ["ciclo-weekend-uni.html"],
    "ciclo-weekend-uni.html": ["NostraWEEKEND", "Sabatino", "Dominical", "nostra-weekend-uni"]
}
for rel, needles in checks.items():
    text = read(rel)
    for needle in needles:
        if needle not in text:
            raise RuntimeError(f"Validación fallida: {needle!r} no aparece en {rel}")

print("NostraWEEKEND integrado correctamente en código, inscripción, administración, Culqi, navegación y SEO.")
