/* i18n.js — lightweight EN / KH language switcher
   ----------------------------------------------------------------
   - Reads the saved language from localStorage (default: "en")
   - Swaps visible text on any element carrying data-en / data-kh
     (use data-i18n-attr="placeholder" to translate an attribute
      instead of the element's text)
   - Renders a flag button (.lang-toggle) showing the CURRENT language
   - Persists the choice so it carries across every page
   ---------------------------------------------------------------- */
(function () {
  'use strict';

  var STORAGE_KEY = 'site-lang';
  var DEFAULT_LANG = 'en';
  var LANGS = ['en', 'kh'];

  // Two-letter labels shown on the toggle button
  var LABELS = { en: 'EN', kh: 'KH' };

  // Full names used for accessible labels
  var NAMES = { en: 'English', kh: 'ខ្មែរ (Khmer)' };

  // Inline SVG flags (2:1) — drawn so they render on every OS,
  // unlike flag emoji which Windows shows as plain letters.
  var FLAGS = {
    // United Kingdom — simplified Union Jack
    en:
      '<svg class="flag-svg" viewBox="0 0 60 30" aria-hidden="true" focusable="false">' +
        '<rect width="60" height="30" fill="#012169"/>' +
        '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>' +
        '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" stroke-width="4"/>' +
        '<rect x="25" width="10" height="30" fill="#fff"/>' +
        '<rect y="10" width="60" height="10" fill="#fff"/>' +
        '<rect x="27" width="6" height="30" fill="#c8102e"/>' +
        '<rect y="12" width="60" height="6" fill="#c8102e"/>' +
      '</svg>',
    // Cambodia — blue/red/blue bands with simplified Angkor Wat
    kh:
      '<svg class="flag-svg" viewBox="0 0 60 30" aria-hidden="true" focusable="false">' +
        '<rect width="60" height="30" fill="#032ea1"/>' +
        '<rect y="7.5" width="60" height="15" fill="#e00025"/>' +
        '<g fill="#fff">' +
          '<rect x="29.1" y="11" width="1.8" height="8"/>' +
          '<rect x="24" y="13" width="1.4" height="6"/>' +
          '<rect x="34.6" y="13" width="1.4" height="6"/>' +
          '<rect x="22" y="18" width="16" height="1.6"/>' +
          '<polygon points="30,8.8 28.5,11 31.5,11"/>' +
          '<polygon points="24.7,11.4 23.7,13 25.7,13"/>' +
          '<polygon points="35.3,11.4 34.3,13 36.3,13"/>' +
        '</g>' +
      '</svg>'
  };

  function safeGet() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function safeSet(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  function getLang() {
    var saved = safeGet();
    return LANGS.indexOf(saved) !== -1 ? saved : DEFAULT_LANG;
  }

  function translate(lang) {
    var nodes = document.querySelectorAll('[data-en], [data-kh]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var value = el.getAttribute('data-' + lang);
      if (value === null) continue;
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        el.textContent = value;
      }
    }
  }

  function renderToggles(lang) {
    var next = lang === 'en' ? 'kh' : 'en';
    var buttons = document.querySelectorAll('.lang-toggle');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.innerHTML =
        '<span class="lang-toggle__flag">' + FLAGS[lang] + '</span>' +
        '<span class="lang-toggle__label">' + LABELS[lang] + '</span>';
      btn.setAttribute('aria-label',
        'Language: ' + NAMES[lang] + '. Switch to ' + NAMES[next]);
      btn.setAttribute('title', 'Switch to ' + NAMES[next]);
    }
  }

  function apply(lang) {
    document.documentElement.lang = (lang === 'kh') ? 'km' : 'en';
    translate(lang);
    renderToggles(lang);
  }

  function toggle() {
    var next = getLang() === 'en' ? 'kh' : 'en';
    safeSet(next);
    apply(next);
  }

  function init() {
    apply(getLang());
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.lang-toggle') : null;
      if (btn) {
        e.preventDefault();
        toggle();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
