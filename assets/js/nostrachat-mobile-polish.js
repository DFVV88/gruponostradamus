/* ==================================================
   NostraCHAT - Mejoras móviles
   Ajustes visuales para celular sin cambiar la lógica.
================================================== */
(function () {
  function injectStyles() {
    if (document.getElementById('nostrachat-mobile-polish-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-mobile-polish-style';
    style.textContent = `
      @media (max-width: 760px) {
        html, body { overflow-x: hidden; }
        .top { font-size: 13px; line-height: 1.25; padding: 9px 10px; }
        .wrap { width: min(100% - 20px, 1160px); }
        .nav { padding: 12px 0; gap: 10px; }
        .logo img { width: 48px; }
        .logo span { font-size: 15px; }
        .menu { width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        .menu a { background: #f7fdff; border: 1px solid rgba(7,140,149,.14); border-radius: 999px; padding: 9px 10px; text-align: center; font-size: 13px; }
        .hero { padding: 42px 0 46px; }
        h1 { font-size: clamp(42px, 15vw, 62px); }
        .lead { font-size: 17px; line-height: 1.5; }
        .chat-preview { border-radius: 24px; padding: 15px; }
        .section { padding: 42px 0; }
        .title h2 { font-size: clamp(31px, 10vw, 44px); }
        .title p { font-size: 16px; line-height: 1.55; }
        .zone { border-radius: 24px; padding: 22px; }
        .zone h3 { font-size: 30px; }
        .zone p, .zone li { font-size: 15px; }

        #nostrachat-live { padding: 38px 0 24px !important; }
        #nostrachat-live .nchat-wrap { width: min(100% - 14px, 1180px) !important; }
        .nchat-title { margin-bottom: 18px !important; }
        .nchat-title span { font-size: 11px !important; padding: 7px 11px !important; }
        .nchat-title h2 { font-size: clamp(29px, 10vw, 42px) !important; }
        .nchat-title p { font-size: 15px !important; line-height: 1.5 !important; }
        .nchat-shell { display: flex !important; flex-direction: column !important; gap: 12px !important; }
        .nchat-card { border-radius: 22px !important; box-shadow: 0 14px 34px rgba(6,20,38,.08) !important; }
        .nchat-side { padding: 15px !important; }
        .nchat-side h3 { font-size: 22px !important; }
        .nchat-side p { font-size: 14px !important; margin-bottom: 10px !important; }
        .nchat-zone { margin: 7px 0 !important; padding: 11px 12px !important; border-radius: 14px !important; }
        .nchat-room-title { margin: 13px 0 7px !important; font-size: 12px !important; }
        .nchat-room-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 7px !important; margin-bottom: 12px !important; }
        .nchat-room { min-height: 46px !important; padding: 9px 10px !important; border-radius: 13px !important; font-size: 13px !important; }
        .nchat-room span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .nchat-auth-card { margin: 12px 0 !important; padding: 14px !important; border-radius: 18px !important; }
        .nchat-auth-card h4 { font-size: 18px !important; }
        .nchat-auth-card p { font-size: 13px !important; }
        .nchat-auth-tabs { gap: 7px !important; }
        .nchat-auth-tab { padding: 10px 8px !important; font-size: 13px !important; }
        .nchat-auth-row { grid-template-columns: 1fr !important; gap: 0 !important; }
        .nchat-auth-field { margin: 8px 0 !important; }
        .nchat-auth-field input, .nchat-auth-field select { min-height: 44px !important; font-size: 15px !important; }
        .nchat-auth-btn { min-height: 46px !important; font-size: 13px !important; }
        .nchat-auth-message { font-size: 12px !important; }

        .nchat-main { min-height: min(72vh, 650px) !important; }
        .nchat-head { padding: 13px 14px !important; gap: 8px !important; align-items: flex-start !important; }
        .nchat-head strong { font-size: 16px !important; }
        .nchat-head span { font-size: 12px !important; }
        .nchat-pill { font-size: 11px !important; padding: 7px 9px !important; white-space: nowrap !important; }
        .nchat-messages { padding: 12px !important; max-height: 52vh !important; min-height: 330px !important; }
        .nchat-empty { padding: 28px 10px !important; font-size: 14px !important; }
        .nchat-msg { max-width: 96% !important; padding: 10px 11px !important; border-radius: 16px !important; margin-bottom: 10px !important; }
        .nchat-meta { font-size: 11px !important; }
        .nchat-text { font-size: 14px !important; line-height: 1.48 !important; }
        .nchat-text mjx-container, .nchat-msg mjx-container { max-width: 100%; overflow-x: auto; overflow-y: hidden; }
        .nchat-actions { margin-top: 6px !important; }
        .nchat-report { font-size: 10px !important; padding: 5px 8px !important; }

        .nchat-composer { position: sticky !important; bottom: 0 !important; z-index: 8 !important; padding: 10px !important; gap: 8px !important; background: rgba(255,255,255,.96) !important; backdrop-filter: blur(8px); }
        .nchat-composer textarea { width: 100% !important; min-height: 56px !important; max-height: 115px !important; border-radius: 15px !important; font-size: 15px !important; }
        .nchat-send { min-height: 48px !important; width: 100% !important; border-radius: 15px !important; }
        .nchat-note { font-size: 11px !important; padding: 0 11px 12px !important; }

        .nchat-image-tool { padding: 0 10px 10px !important; gap: 7px !important; }
        .nchat-image-btn { width: 100% !important; min-height: 42px !important; }
        .nchat-image-preview { width: 100% !important; justify-content: space-between !important; }
        .nchat-image-preview img { width: 46px !important; height: 46px !important; }
        .nchat-image-notice { margin: 0 10px 10px !important; font-size: 12px !important; }
        .nchat-image-wrap img { width: 100% !important; max-height: 340px !important; }

        .nchat-online-card, .nchat-online-box, [class*="online"] { max-width: 100%; }
        #nchat-online-users, .nchat-online-users, .nchat-online-panel { border-radius: 20px !important; }

        .float-wa { left: 10px !important; right: 10px !important; bottom: 10px !important; padding: 12px 14px !important; font-size: 13px !important; }
        footer { padding: 24px 12px 78px !important; font-size: 13px; }
      }

      @media (max-width: 420px) {
        .nchat-room-grid { grid-template-columns: 1fr !important; }
        .menu { grid-template-columns: 1fr; }
        .nchat-head { flex-direction: column !important; }
        .nchat-pill { align-self: flex-start; }
        .nchat-composer { flex-direction: column !important; }
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStyles);
  else injectStyles();
})();
