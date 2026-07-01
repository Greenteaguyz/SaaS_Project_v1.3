/* nav.js — auto-collapse the mobile nav drawer after a link is tapped
   ----------------------------------------------------------------
   The mobile menu is a CSS checkbox-hack: #nav-toggle (a hidden
   checkbox) drives `.nav__mobile-menu` via the :checked selector.
   Tapping a link inside the drawer would otherwise leave the toggle
   checked, so the menu stays open over the page you just jumped to.
   This unchecks the toggle on link clicks so the drawer closes.

   Only anchors inside .nav__mobile-menu close it — the theme and
   language buttons are <button>s and are intentionally left out so
   you can switch theme/language without the drawer snapping shut.
   ---------------------------------------------------------------- */
(function () {
  'use strict';

  var toggle = document.getElementById('nav-toggle');
  if (!toggle) return;

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('.nav__mobile-menu a') : null;
    if (link) {
      toggle.checked = false;
      syncExpanded();
    }
  });

  /* Accessibility layer (additive — the CSS checkbox-hack still owns the
     open/close state). Keep aria-expanded in sync on the hamburger, move
     focus into the drawer on open, and let Escape close it. */
  var hamburger = document.querySelector('.nav__hamburger-label');
  var menu = document.querySelector('.nav__mobile-menu');

  function syncExpanded() {
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', toggle.checked ? 'true' : 'false');
    }
  }

  toggle.addEventListener('change', function () {
    syncExpanded();
    if (toggle.checked && menu) {
      var firstLink = menu.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && toggle.checked) {
      toggle.checked = false;
      syncExpanded();
      toggle.focus();
    }
  });

  syncExpanded();
})();
