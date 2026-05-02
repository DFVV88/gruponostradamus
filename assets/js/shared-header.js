/* ==================================================
   Grupo Nostradamus - Header compartido Premium
   Replica el estilo superior del index en subpáginas
================================================== */

(function () {
  const currentPath = window.location.pathname.toLowerCase();

  const navItems = [
    { label: "INICIO", url: "index.html", key: "index" },
    { label: "CICLOS", url: "ciclos.html", key: "ciclos" },
    { label: "DOCENTES", url: "docentes.html", key: "docentes" },
    { label: "CACHIMBOS", url: "cachimbos.html", key: "cachimbos" },
    { label: "SEDE", url: "sedes.html", key: "sedes" },
    { label: "NOTICIAS", url: "blog.html", key: "blog" },
    { label: "CONTACTO", url: "contacto.html", key: "contacto" }
  ];

  function isActive(item) {
    if (currentPath.includes(item.key)) return "active";
    if (item.key === "index" && (currentPath.endsWith("/") || currentPath.includes("index"))) return "active";
    return "";
  }

  function createHeader() {
    const target = document.getElementById("site-header");
    if (!target) return;

    target.innerHTML = `
      <header class="nostra-premium-header">

        <div class="nostra-promo-bar">
          <a href="https://wa.me/51993750351?text=Hola%20Nostradamus%2C%20quiero%20informes%20sobre%20los%20nuevos%20ciclos%20UNI" target="_blank" rel="noopener">
            🚀 NUEVOS CICLOS UNI DISPONIBLES · CUPOS LIMITADOS · <span>SOLICITAR INFORMES POR WHATSAPP</span>
          </a>
        </div>

        <div class="nostra-info-bar">
          <div class="nostra-info-left">
            <a href="tel:+51993750351">📞 993 750 351</a>
            <span>📍 Av. Gerardo Unger 193, SMP.</span>
            <a href="mailto:informes@gruponostradamus.edu.pe">✉️ informes@gruponostradamus.edu.pe</a>
          </div>

          <div class="nostra-info-right">
            <a class="nostra-live-btn" href="https://gruponostradamus.edu.pe/" target="_blank" rel="noopener">
              🔴 CLASES EN VIVO
            </a>
            <span>Síguenos en:</span>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="TikTok">♪</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>

        <div class="nostra-main-header">
          <a class="nostra-logo" href="index.html">
            <img src="assets/img/logo.png" alt="Grupo Nostradamus">
          </a>

          <nav class="nostra-nav">
            ${navItems.map(item => `
              <a class="${isActive(item)}" href="${item.url}">${item.label}</a>
            `).join("")}
          </nav>

          <a class="nostra-cta" href="https://wa.me/51993750351?text=Hola%20Nostradamus%2C%20quiero%20solicitar%20informes" target="_blank" rel="noopener">
            📲 SOLICITAR INFORMES <span>→</span>
          </a>

          <button class="nostra-mobile-toggle" type="button" aria-label="Abrir menú">
            ☰
          </button>
        </div>

        <div class="nostra-mobile-panel">
          ${navItems.map(item => `
            <a class="${isActive(item)}" href="${item.url}">${item.label}</a>
          `).join("")}

          <a class="nostra-mobile-cta" href="https://wa.me/51993750351?text=Hola%20Nostradamus%2C%20quiero%20solicitar%20informes" target="_blank" rel="noopener">
            📲 Solicitar informes
          </a>
        </div>

      </header>
    `;

    const toggle = target.querySelector(".nostra-mobile-toggle");
    const panel = target.querySelector(".nostra-mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
        toggle.textContent = panel.classList.contains("open") ? "×" : "☰";
      });
    }
  }

  function injectStyles() {
    if (document.getElementById("nostra-shared-header-style")) return;

    const style = document.createElement("style");
    style.id = "nostra-shared-header-style";
    style.textContent = `
      .nostra-premium-header {
        width: 100%;
        position: relative;
        z-index: 999;
        font-family: inherit;
        background: #ffffff;
        box-shadow: 0 8px 28px rgba(0,0,0,.08);
      }

      .nostra-promo-bar {
        background: linear-gradient(90deg, #02070d, #007f86);
        color: #ffffff;
        text-align: center;
        padding: 11px 16px;
        font-size: 15px;
        font-weight: 950;
        letter-spacing: .7px;
      }

      .nostra-promo-bar a {
        color: #ffffff;
        text-decoration: none;
      }

      .nostra-promo-bar span {
        text-decoration: underline;
        text-underline-offset: 5px;
      }

      .nostra-info-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 18px;
        padding: 13px 42px;
        background: linear-gradient(90deg, #062033, #008b96);
        color: #ffffff;
        font-size: 14px;
        font-weight: 800;
      }

      .nostra-info-bar a {
        color: #ffffff;
        text-decoration: none;
      }

      .nostra-info-left,
      .nostra-info-right {
        display: flex;
        align-items: center;
        gap: 22px;
        flex-wrap: wrap;
      }

      .nostra-live-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 10px 20px;
        border-radius: 999px;
        background: linear-gradient(135deg, #ff1f1f, #ff5b1f);
        color: #ffffff !important;
        font-weight: 950;
        box-shadow: 0 0 24px rgba(255, 60, 30, .42);
      }

      .nostra-main-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 28px;
        min-height: 118px;
        padding: 20px 48px;
        background: #ffffff;
      }

      .nostra-logo img {
        max-width: 190px;
        width: 100%;
        height: auto;
        display: block;
      }

      .nostra-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 34px;
        flex: 1;
      }

      .nostra-nav a {
        color: #061426;
        text-decoration: none;
        font-size: 15px;
        font-weight: 950;
        letter-spacing: .5px;
        position: relative;
        padding: 8px 0;
      }

      .nostra-nav a::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 0;
        height: 3px;
        border-radius: 999px;
        background: #00c2d1;
        transition: width .25s ease;
      }

      .nostra-nav a:hover::after,
      .nostra-nav a.active::after {
        width: 100%;
      }

      .nostra-nav a.active {
        color: #008b96;
      }

      .nostra-cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 54px;
        padding: 14px 26px;
        border-radius: 18px;
        background: linear-gradient(135deg, #008b96, #061426);
        color: #ffffff;
        text-decoration: none;
        font-size: 14px;
        font-weight: 950;
        box-shadow: 0 14px 30px rgba(0, 137, 150, .28);
        white-space: nowrap;
      }

      .nostra-cta span {
        font-size: 22px;
        line-height: 1;
      }

      .nostra-mobile-toggle {
        display: none;
        border: none;
        background: linear-gradient(135deg, #008b96, #061426);
        color: #ffffff;
        width: 46px;
        height: 46px;
        border-radius: 14px;
        font-size: 24px;
        font-weight: 900;
      }

      .nostra-mobile-panel {
        display: none;
        background: #061426;
        padding: 14px;
      }

      .nostra-mobile-panel a {
        display: block;
        color: #ffffff;
        text-decoration: none;
        font-size: 14px;
        font-weight: 900;
        padding: 13px 14px;
        border-radius: 12px;
        margin-bottom: 8px;
        background: rgba(255,255,255,.06);
      }

      .nostra-mobile-panel a.active {
        background: linear-gradient(135deg, #00c2d1, #008b96);
      }

      .nostra-mobile-cta {
        background: linear-gradient(135deg, #25d366, #13a54d) !important;
        text-align: center;
        margin-top: 10px;
      }

      @media (max-width: 1199px) {
        .nostra-main-header {
          padding: 18px 28px;
          gap: 18px;
        }

        .nostra-nav {
          gap: 20px;
        }

        .nostra-cta {
          padding: 12px 18px;
          font-size: 13px;
        }
      }

      @media (max-width: 991px) {
        .nostra-info-bar {
          display: none;
        }

        .nostra-main-header {
          min-height: 88px;
          padding: 14px 18px;
        }

        .nostra-logo img {
          max-width: 150px;
        }

        .nostra-nav,
        .nostra-cta {
          display: none;
        }

        .nostra-mobile-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .nostra-mobile-panel.open {
          display: block;
        }

        .nostra-promo-bar {
          font-size: 12px;
          line-height: 1.4;
          padding: 9px 14px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  injectStyles();
  createHeader();
})();
