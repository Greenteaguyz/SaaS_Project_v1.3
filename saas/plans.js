/* plans.js — dashboard plan demo (Free / Pro / Team)
   ----------------------------------------------------------------
   - Sets data-plan="free|pro|team" on <html>
   - Plan-scoped UI is shown/hidden purely by CSS via [data-plan-only]
     (so there is no flash); this script only handles interaction:
       * the in-page "Preview plan" switcher (.plan-switch__btn)
       * any upgrade/upsell control carrying [data-plan-set]
   - Persists the choice in localStorage ("dash-plan")
   - Reflects the active plan in the URL (?plan=) without a reload so
     the view can be deep-linked and shared
   - The early inline script in dashboard.html applies the initial
     plan before paint; this file keeps everything in sync afterwards
   ---------------------------------------------------------------- */
(function () {
  'use strict';

  // The normal dashboard ALWAYS boots as Free. We do not read localStorage
  // or ?plan= on init, and we do not persist switcher changes — the in-page
  // "Preview plan" buttons still work for a demo, but a refresh returns to Free.
  var STORAGE_KEY = 'dash-plan';
  var VALID = ['free', 'pro', 'team'];

  function isValid(plan) {
    return VALID.indexOf(plan) !== -1;
  }

  // Clear any previously persisted plan so old sessions don't linger.
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }

  function syncControls(plan) {
    var buttons = document.querySelectorAll('.plan-switch__btn');
    for (var i = 0; i < buttons.length; i++) {
      var setTo = buttons[i].getAttribute('data-plan-set');
      buttons[i].setAttribute('aria-pressed', setTo === plan ? 'true' : 'false');
    }
  }

  function apply(plan) {
    if (!isValid(plan)) plan = 'free';
    document.documentElement.setAttribute('data-plan', plan);
    syncControls(plan);
    // No save(), no URL sync — session-only, no persistence.
  }

  function init() {
    // Force Free on every load, regardless of URL or storage.
    apply('free');

    document.addEventListener('click', function (e) {
      var target = e.target.closest ? e.target.closest('[data-plan-set]') : null;
      if (!target) return;
      var plan = target.getAttribute('data-plan-set');
      if (!isValid(plan)) return;
      e.preventDefault();
      apply(plan);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

