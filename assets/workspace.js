/* Small reader-workspace enhancements layered on top of Docsify. */
(function () {
  'use strict';
  var publishedNotes = null;
  var publishedNotesRequest = null;
  var selectedCategory = 'all';
  var visibleNoteCount = 0;
  var categoryLabels = {
    'incident-response': 'Investigations',
    'digital-forensics': 'Digital forensics',
    'threat-hunting': 'Threat hunting',
    'detection-engineering': 'Detection engineering',
    'malware-analysis': 'Malware analysis',
    'cloud-security': 'Cloud security',
    'osint': 'OSINT',
    'cheat-sheets': 'Pinned cheat sheets',
    'reference': 'Reference & workflow'
  };
  var categoryOrder = [
    'incident-response', 'digital-forensics', 'threat-hunting',
    'detection-engineering', 'malware-analysis', 'cloud-security', 'osint', 'cheat-sheets', 'reference'
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function routeForNote(path) {
    return '#/' + path.replace(/\.md$/i, '').split('/').map(encodeURIComponent).join('/');
  }

  function metadataFromContent(content) {
    var frontMatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontMatter || !window.jsyaml) return {};
    try {
      var metadata = window.jsyaml.load(frontMatter[1], { schema: window.jsyaml.JSON_SCHEMA });
      return metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {};
    } catch (error) {
      return {};
    }
  }

  function noteFromContent(file, content) {
    var metadata = metadataFromContent(content);
    return {
      path: file.path,
      title: typeof metadata.title === 'string' && metadata.title.trim() ? metadata.title.trim() : file.name.replace(/\.md$/i, ''),
      category: typeof metadata.category === 'string' ? metadata.category : 'reference',
      status: typeof metadata.status === 'string' ? metadata.status : 'draft',
      tags: Array.isArray(metadata.tags) ? metadata.tags.filter(function (tag) { return typeof tag === 'string'; }) : [],
      updated: typeof metadata.updated === 'string' ? metadata.updated : '',
      content: content
    };
  }

  function renderPublishedNotes() {
    var navigation = document.querySelector('.sidebar-nav');
    if (!navigation || !publishedNotes) return;
    var currentPath = decodeURIComponent(window.location.hash.split('?')[0]).replace(/^#\//, '');
    var groups = {};
    publishedNotes.filter(function (note) {
      return selectedCategory === 'all' || note.category === selectedCategory;
    }).forEach(function (note) {
      var category = categoryLabels[note.category] ? note.category : 'reference';
      (groups[category] = groups[category] || []).push(note);
    });
    visibleNoteCount = Object.keys(groups).reduce(function (count, category) { return count + groups[category].length; }, 0);
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
    mountSearchTools();
    renderRecentNotes();
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
            return noteFromContent(file, content);
          });
        }));
      }).then(function (notes) {
        publishedNotes = notes;
      }, function (error) {
        // Keep the built-in sidebar as a readable fallback if GitHub is unavailable.
        console.warn('Published note index could not be loaded.', error);
        publishedNotes = null;
        publishedNotesRequest = null;
      });
    }
    publishedNotesRequest.then(renderPublishedNotes);
  }

  function searchText(note) {
    return [note.title, categoryLabels[note.category] || '', note.status, note.tags.join(' '), note.content]
      .join(' ').toLocaleLowerCase();
  }

  function updateSearchCount(count, query) {
    var counter = document.querySelector('.search-result-count');
    if (!counter) return;
    counter.textContent = query ? count + (count === 1 ? ' result' : ' results') :
      visibleNoteCount + (visibleNoteCount === 1 ? ' note' : ' notes');
  }

  function renderLiveSearch(value) {
    var search = document.querySelector('.search');
    var navigation = document.querySelector('.sidebar-nav');
    if (!search || !navigation || !publishedNotes) return;
    var panel = search.querySelector('.results-panel');
    var query = value.trim().toLocaleLowerCase();
    if (!query) {
      panel.classList.remove('show');
      panel.innerHTML = '';
      navigation.classList.remove('hide');
      updateSearchCount(visibleNoteCount, '');
      return;
    }
    var results = publishedNotes.filter(function (note) {
      return (selectedCategory === 'all' || note.category === selectedCategory) && searchText(note).indexOf(query) !== -1;
    });
    panel.innerHTML = results.length ? results.map(function (note) {
      var plain = note.content.replace(/^---[\s\S]*?---\s*/m, '').replace(/[#*_`>|\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
      var position = plain.toLocaleLowerCase().indexOf(query);
      var excerpt = position < 0 ? plain.slice(0, 120) : plain.slice(Math.max(0, position - 45), position + query.length + 75);
      return '<a class="matching-post live-search-result" href="' + routeForNote(note.path) + '">' +
        '<h2>' + escapeHtml(note.title) + '</h2><p>' + escapeHtml(categoryLabels[note.category] || 'Reference & workflow') +
        (excerpt ? ' · ' + escapeHtml(excerpt) : '') + '</p></a>';
    }).join('') : '<p class="empty">No matching notes.</p>';
    panel.classList.add('show');
    navigation.classList.add('hide');
    updateSearchCount(results.length, query);
  }

  function mountSearchTools() {
    var search = document.querySelector('.search');
    if (!search || !publishedNotes) return;
    var input = search.querySelector('input[type="search"]');
    var toolbar = search.querySelector('.search-tools');
    if (!input) return;
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'search-tools';
      toolbar.innerHTML = '<select class="note-category-filter" aria-label="Filter notes by category"></select><span class="search-result-count" aria-live="polite"></span>';
      search.querySelector('.input-wrap').insertAdjacentElement('afterend', toolbar);
      input.addEventListener('input', function (event) {
        event.stopImmediatePropagation();
        renderLiveSearch(input.value);
      }, true);
      toolbar.querySelector('.note-category-filter').addEventListener('change', function (event) {
        selectedCategory = event.target.value;
        renderPublishedNotes();
        renderLiveSearch(input.value);
      });
    }
    var filter = toolbar.querySelector('.note-category-filter');
    filter.innerHTML = '<option value="all">All categories</option>' + categoryOrder.filter(function (category) {
      return publishedNotes.some(function (note) { return note.category === category; });
    }).map(function (category) {
      return '<option value="' + category + '">' + escapeHtml(categoryLabels[category]) + '</option>';
    }).join('');
    filter.value = selectedCategory;
    renderLiveSearch(input.value);
  }

  function renderRecentNotes() {
    var target = document.getElementById('recent-notes');
    if (!target || !publishedNotes) return;
    target.classList.add('recent-notes');
    var recent = publishedNotes.slice().sort(function (left, right) {
      return (Date.parse(right.updated) || 0) - (Date.parse(left.updated) || 0);
    }).slice(0, 5);
    target.innerHTML = recent.map(function (note) {
      var date = Date.parse(note.updated);
      var dateLabel = Number.isNaN(date) ? 'Date not set' : new Date(date).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });
      return '<a class="recent-note" href="' + routeForNote(note.path) + '"><span class="recent-note__category">' +
        escapeHtml(categoryLabels[note.category] || 'Reference & workflow') + '</span><strong>' + escapeHtml(note.title) +
        '</strong><small>' + escapeHtml(dateLabel) + '</small></a>';
    }).join('');
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
      '<a class="profile-card__about" href="#/notes/about">About this notebook</a>' +
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
    card.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeLogo();
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
