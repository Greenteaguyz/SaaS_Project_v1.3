/* theme.js — light / dark mode toggle
   ----------------------------------------------------------------
   - Sets data-theme="light|dark" on <html>
   - Persists the choice in localStorage ("site-theme")
   - Falls back to the OS color-scheme preference on first visit
   - Renders any .theme-toggle button with a sun/moon icon
   ---------------------------------------------------------------- */
(function () {
  'use strict';

  var STORAGE_KEY = 'site-theme';

  // Icons show the state you'd switch TO: moon while light, sun while dark.
  var MOON =
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
    '</svg>';
  var SUN =
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4"/>' +
      '<path d="M12 2v2"/><path d="M12 20v2"/>' +
      '<path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>' +
      '<path d="M2 12h2"/><path d="M20 12h2"/>' +
      '<path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>' +
    '</svg>';

  function stored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function save(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }
  }

  function initial() {
    var s = stored();
    if (s === 'dark' || s === 'light') return s;
    if (window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function render(theme) {
    var next = theme === 'dark' ? 'light' : 'dark';
    var buttons = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.innerHTML = theme === 'dark' ? SUN : MOON;
      btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      btn.setAttribute('title', 'Switch to ' + next + ' mode');
    }
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Keep Bootstrap's dark mode (data-bs-theme) in sync with the site theme.
    document.documentElement.setAttribute('data-bs-theme', theme);
    render(theme);
  }

  function toggle() {
    var next = (document.documentElement.getAttribute('data-theme') === 'dark')
      ? 'light' : 'dark';
    save(next);
    apply(next);
  }

  function init() {
    apply(initial());
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.theme-toggle') : null;
      if (btn) {
        e.preventDefault();
        toggle();
      }
    });
  }

  // Apply the stored/initial theme immediately to minimise flash.
  var startTheme = initial();
  document.documentElement.setAttribute('data-theme', startTheme);
  document.documentElement.setAttribute('data-bs-theme', startTheme);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
