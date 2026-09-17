/* Small reader-workspace enhancements layered on top of Docsify. */
(function () {
  'use strict';

  function mountWorkspaceBar() {
    var section = document.querySelector('.markdown-section');
    if (!section || section.querySelector('.workspace-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'workspace-bar';
    bar.innerHTML = '<span class="workspace-bar__badge">Field notebook</span><span class="workspace-bar__divider" aria-hidden="true"></span><span>Read, search, and capture what matters.</span>';
    section.insertBefore(bar, section.firstChild);
  }

  function mountProfileLogo() {
    if (document.querySelector('.profile-logo')) return;
    var editLink = document.createElement('a');
    editLink.className = 'top-edit-notes';
    editLink.href = '/admin/';
    editLink.setAttribute('data-no-router', '');
    editLink.textContent = 'Edit notes';
    document.body.appendChild(editLink);

    var logo = document.createElement('button');
    logo.className = 'profile-logo';
    logo.type = 'button';
    logo.setAttribute('aria-label', 'Expand personal logo');
    logo.setAttribute('aria-expanded', 'false');
    logo.innerHTML = '<img src="/assets/me.png" alt="Ahmad\'s personal logo">';
    document.body.appendChild(logo);

    function closeLogo() {
      logo.classList.remove('profile-logo--expanded');
      logo.setAttribute('aria-expanded', 'false');
    }

    logo.addEventListener('click', function (event) {
      event.stopPropagation();
      var expanded = logo.classList.toggle('profile-logo--expanded');
      logo.setAttribute('aria-expanded', String(expanded));
    });
    document.addEventListener('click', function (event) {
      if (!logo.contains(event.target)) closeLogo();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeLogo();
    });
  }

  function improveSidebar() {
    var categoryLabels = {
      'Investigations': 'investigations',
      'Reference & workflow': 'reference'
    };
    document.querySelectorAll('.sidebar-nav strong').forEach(function (label) {
      var category = categoryLabels[label.textContent.trim()];
      if (!category) return;
      var item = label.closest('li');
      var toggle = label.closest('p');
      var notes = item && item.querySelector(':scope > ul');
      if (!item || !toggle || !notes) return;

      item.classList.add('sidebar-category');
      item.setAttribute('data-category', category);
      notes.id = 'category-notes-' + category;
      toggle.classList.add('sidebar-category-toggle');
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('aria-controls', notes.id);

      function setExpanded(expanded) {
        item.classList.toggle('sidebar-category--collapsed', !expanded);
        toggle.setAttribute('aria-expanded', String(expanded));
      }

      // Keep the selected note visible after it is opened. Categories otherwise
      // start closed, so the sidebar remains a short list of folders.
      if (!item.dataset.categoryReady) {
        item.dataset.categoryReady = 'true';
        setExpanded(Boolean(item.querySelector('a.active')));
        function toggleCategory(event) {
          event.preventDefault();
          setExpanded(item.classList.contains('sidebar-category--collapsed'));
        }
        toggle.addEventListener('click', toggleCategory);
        toggle.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') toggleCategory(event);
        });
      } else if (item.querySelector('a.active')) {
        setExpanded(true);
      }
    });

    var searchInput = document.querySelector('.search input');
    if (!searchInput || searchInput.parentNode.querySelector('.search-clear')) return;
    searchInput.placeholder = 'Search notes, commands, and cases';
    searchInput.setAttribute('aria-label', 'Search all listed notes');
    var clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'search-clear';
    clear.setAttribute('aria-label', 'Clear search');
    clear.textContent = '×';
    clear.addEventListener('click', function () {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.focus();
    });
    searchInput.parentNode.appendChild(clear);
  }

  document.addEventListener('keydown', function (event) {
    var active = document.activeElement;
    var editable = active && (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName));
    if (event.key === '/' && !editable) {
      var searchInput = document.querySelector('.search input');
      if (searchInput) {
        event.preventDefault();
        searchInput.focus();
      }
    }
  });

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      window.setTimeout(function () {
        mountWorkspaceBar();
        mountProfileLogo();
        improveSidebar();
      }, 0);
    });
  });
}());
