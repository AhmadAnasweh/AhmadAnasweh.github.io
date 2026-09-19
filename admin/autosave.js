/* Save Decap editorial drafts every five minutes, never publishing them. */
(function () {
  'use strict';

  var fiveMinutes = 5 * 60 * 1000;
  var soonTimer = null;
  var saving = false;

  function announce(message) {
    if (window.notesDraftAutosave) window.notesDraftAutosave.status = message;
    document.dispatchEvent(new CustomEvent('notes-autosave', { detail: message }));
  }

  function editorRoute() {
    return /^#\/collections\/notes\/(new|entries\/)/.test(window.location.hash);
  }

  function saveDraft() {
    if (!editorRoute() || saving || (window.__notesImageUploads || 0) > 0) return;
    var toolbar = document.querySelector('[class*="-ToolbarContainer"]');
    if (!toolbar || !/unsaved changes/i.test(toolbar.textContent)) return;
    var saveButton = Array.from(toolbar.querySelectorAll('button')).find(function (button) {
      return button.textContent.trim() === 'Save' && !button.disabled;
    });
    if (!saveButton) return;
    saving = true;
    announce('Saving an unpublished draft...');
    saveButton.click();
    // Decap also reports save failures in its own notification area.
    window.setTimeout(function () {
      saving = false;
      var currentToolbar = document.querySelector('[class*="-ToolbarContainer"]');
      if (currentToolbar && /changes saved/i.test(currentToolbar.textContent)) {
        announce('Unpublished draft saved at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '.');
      } else {
        announce('Draft still has unsaved changes. Check the editor notification.');
      }
    }, 8000);
  }

  window.notesDraftAutosave = {
    scheduleSoon: function () {
      window.clearTimeout(soonTimer);
      soonTimer = window.setTimeout(saveDraft, 15000);
    }
  };
  window.setInterval(saveDraft, fiveMinutes);
  window.CMS.registerEventListener({
    name: 'postSave',
    handler: function () {
      saving = false;
      announce('Unpublished draft saved at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '.');
    }
  });
}());
