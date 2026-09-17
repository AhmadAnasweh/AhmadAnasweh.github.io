/* Small reader-workspace enhancements layered on top of Docsify. */
(function () {
  'use strict';
  var publishedNotes = null;
  var publishedNotesRequest = null;
  var categoryLabels = {
    'incident-response': 'Investigations',
    'digital-forensics': 'Digital forensics',
    'threat-hunting': 'Threat hunting',
    'detection-engineering': 'Detection engineering',
    'malware-analysis': 'Malware analysis',
    'cloud-security': 'Cloud security',
    'osint': 'OSINT',
    'reference': 'Reference & workflow'
  };
  var categoryOrder = [
    'incident-response', 'digital-forensics', 'threat-hunting',
    'detection-engineering', 'malware-analysis', 'cloud-security', 'osint', 'reference'
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function routeForNote(path) {
    return '#/' + path.replace(/\.md$/i, '').split('/').map(encodeURIComponent).join('/');
  }

  function fieldFromFrontMatter(content, field) {
    var frontMatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontMatter) return '';
    var match = frontMatter[1].match(new RegExp('^' + field + ':\\s*(.+?)\\s*$', 'm'));
    return match ? match[1].replace(/^['"]|['"]$/g, '').trim() : '';
  }

  function renderPublishedNotes() {
    var navigation = document.querySelector('.sidebar-nav');
    if (!navigation || !publishedNotes) return;
    var currentPath = decodeURIComponent(window.location.hash.split('?')[0]).replace(/^#\//, '');
    var groups = {};
    publishedNotes.forEach(function (note) {
      var category = categoryLabels[note.category] ? note.category : 'reference';
      (groups[category] = groups[category] || []).push(note);
    });
    Object.keys(groups).forEach(function (category) {
      groups[category].sort(function (left, right) { return left.title.localeCompare(right.title); });
    });

    var html = '<ul><li><a href="#/">Home</a></li>' +
      '<li><a href="/admin/" data-no-router data-nosearch>Edit notes</a></li>';
    categoryOrder.forEach(function (category) {
      var notes = groups[category];
      if (!notes || !notes.length) return;
      html += '<li class="sidebar-category" data-category="' + category + '"><p><strong>' +
        escapeHtml(categoryLabels[category]) + '</strong></p><ul>';
      notes.forEach(function (note) {
        var active = note.path.replace(/\.md$/i, '') === currentPath ? ' class="active"' : '';
        html += '<li><a' + active + ' href="' + routeForNote(note.path) + '">' + escapeHtml(note.title) + '</a></li>';
      });
      html += '</ul></li>';
    });
    navigation.innerHTML = html + '</ul>';
    improveSidebar();
  }

  function loadPublishedNotes() {
    if (publishedNotes) {
      renderPublishedNotes();
      return;
    }
    if (!publishedNotesRequest) {
      publishedNotesRequest = fetch('https://api.github.com/repos/AhmadAnasweh/AhmadAnasweh.github.io/contents/notes', {
        headers: { Accept: 'application/vnd.github+json' }
      }).then(function (response) {
        if (!response.ok) throw new Error('Could not load the note index.');
        return response.json();
      }).then(function (files) {
        files = files.filter(function (file) { return file.type === 'file' && /\.md$/i.test(file.name); });
        return Promise.all(files.map(function (file) {
          return fetch(file.download_url).then(function (response) {
            if (!response.ok) throw new Error('Could not load a note.');
            return response.text();
          }).then(function (content) {
            return {
              path: file.path,
              title: fieldFromFrontMatter(content, 'title') || file.name.replace(/\.md$/i, ''),
              category: fieldFromFrontMatter(content, 'category')
            };
          });
        }));
      }).then(function (notes) {
        publishedNotes = notes;
      }).catch(function (error) {
        // Keep the built-in sidebar as a readable fallback if GitHub is unavailable.
        console.warn('Published note index could not be loaded.', error);
        publishedNotes = null;
        publishedNotesRequest = null;
      });
    }
    publishedNotesRequest.then(renderPublishedNotes);
  }

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

    var card = document.createElement('aside');
    card.className = 'profile-card';
    card.setAttribute('aria-label', 'Ahmad Anasweh profile links');
    card.innerHTML = '<img src="/assets/me.png" alt="Ahmad Anasweh">' +
      '<div class="profile-card__links">' +
      '<a class="profile-card__link profile-card__link--linkedin" href="https://www.linkedin.com/in/ahmad-anasweh/" target="_blank" rel="noopener noreferrer">LinkedIn</a>' +
      '<a class="profile-card__link profile-card__link--github" href="https://github.com/AhmadAnasweh" target="_blank" rel="noopener noreferrer">GitHub</a>' +
      '</div>';
    document.body.appendChild(card);

    function closeLogo() {
      card.classList.remove('profile-card--open');
      logo.setAttribute('aria-expanded', 'false');
    }

    logo.addEventListener('click', function (event) {
      event.stopPropagation();
      var expanded = card.classList.toggle('profile-card--open');
      logo.setAttribute('aria-expanded', String(expanded));
    });
    document.addEventListener('click', function (event) {
      if (!logo.contains(event.target) && !card.contains(event.target)) closeLogo();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeLogo();
    });
  }

  function improveSidebar() {
    var sidebarCategoryLabels = {
      'Investigations': 'investigations',
      'Digital forensics': 'digital-forensics',
      'Threat hunting': 'threat-hunting',
      'Detection engineering': 'detection-engineering',
      'Malware analysis': 'malware-analysis',
      'Cloud security': 'cloud-security',
      'OSINT': 'osint',
      'Reference & workflow': 'reference'
    };
    document.querySelectorAll('.sidebar-nav strong').forEach(function (label) {
      var category = sidebarCategoryLabels[label.textContent.trim()];
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
        loadPublishedNotes();
      }, 0);
    });
  });
}());
