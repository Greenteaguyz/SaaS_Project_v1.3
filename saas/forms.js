/* forms.js — auth/contact form submit handling (prototype, no backend)
   ----------------------------------------------------------------
   The auth and contact forms are real <form action="…" method="get">
   elements whose submit control is a <button type="submit">. Native
   HTML validation (required / pattern / minlength) runs on submit
   because the forms no longer carry `novalidate`, so invalid input is
   blocked with the browser's own messages and Enter-to-submit works.

   On a VALID submit we intercept and navigate to the form's `action`
   ourselves. This keeps the prototype's page-to-page flow intact while
   avoiding a real GET submission, which would otherwise append the
   field values (including the password) to the URL — credentials in
   the address bar / history. No values are ever serialized.

   Degrades safely: with JS disabled the form still submits natively to
   its `action` page, so navigation is never lost.
   ---------------------------------------------------------------- */
(function () {
  'use strict';

  function onSubmit(e) {
    var form = e.currentTarget;
    // Always stop the native GET submission first, so field values can
    // never be serialized into the URL (credentials in the address bar /
    // history) even if constraint validation behaves oddly in some engine.
    e.preventDefault();
    // Show the browser's native validation messages and block navigation
    // while the form is invalid.
    if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
      return;
    }
    var action = form.getAttribute('action');
    if (action) {
      window.location.assign(action);
    }
  }

  var forms = document.querySelectorAll('form.auth-form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', onSubmit);
  }
})();
