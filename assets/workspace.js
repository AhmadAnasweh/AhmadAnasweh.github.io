/* Small reader-workspace enhancements layered on top of Docsify. */
(function () {
  'use strict';
  var publishedNotes = null;
  var publishedNotesRequest = null;
  var selectedCategory = 'all';
  var visibleNoteCount = 0;
  var lastRenderedPath = '';
  var categoryLabels = {
    'incident-response': 'Investigations',
    'digital-forensics': 'Digital forensics',
    'threat-hunting': 'Threat hunting',
    'detection-engineering': 'Detection engineering',
    'malware-analysis': 'Malware analysis',
    'cloud-security': 'Cloud security',
    'osint': 'OSINT',
    'cheat-sheets': 'Pinned cheat sheets',
    'reference': 'Reference & workflow',
    'my-tools': 'My tools'
  };
  var categoryOrder = [
    'incident-response', 'digital-forensics', 'threat-hunting',
    'detection-engineering', 'malware-analysis', 'cloud-security', 'osint', 'cheat-sheets', 'my-tools', 'reference'
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function routeForNote(path) {
    return '#/' + path.replace(/\.md$/i, '').split('/').map(encodeURIComponent).join('/');
  }

  function notePassages(content) {
    var body = content.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
    try {
      // A template is inert: Markdown is parsed for search without loading its
      // images or running any HTML that a note may contain.
      var template = document.createElement('template');
      template.innerHTML = window.marked.parse(body);
      template.content.querySelectorAll('script, style').forEach(function (element) { element.remove(); });
      return Array.from(template.content.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, pre, td, th'))
        .filter(function (element) { return !element.querySelector('p, li, pre, td, th'); })
        .map(function (element) {
          return { text: element.textContent.replace(/\s+/g, ' ').trim(), tag: element.tagName };
        }).filter(function (passage) { return Boolean(passage.text); });
    } catch (error) {
      return [{ text: body.replace(/\s+/g, ' ').trim(), tag: 'P' }];
    }
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
      passages: notePassages(content),
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

  function excerptAround(passage, query) {
    var at = passage.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
    if (at < 0) return passage.slice(0, 150) + (passage.length > 150 ? '…' : '');
    var start = Math.max(0, at - 52);
    var end = Math.min(passage.length, at + query.length + 96);
    return (start ? '…' : '') + passage.slice(start, end) + (end < passage.length ? '…' : '');
  }

  function searchHit(note, query) {
    var passage = note.passages.find(function (text) {
      return text.text.toLocaleLowerCase().includes(query.toLocaleLowerCase());
    });
    if (passage) return {
      note: note,
      preview: excerptAround(passage.text, query),
      scope: passage.tag === 'H1' ? 'heading' : 'body'
    };
    var details = [note.title, categoryLabels[note.category] || '', note.status, note.tags.join(' ')].join(' ');
    if (details.toLocaleLowerCase().includes(query.toLocaleLowerCase())) {
      return { note: note, preview: 'Matched in the title or note details. Opens at the top of this note.', scope: 'details' };
    }
    return null;
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
    hideSearchPreview();
    var panel = search.querySelector('.results-panel');
    var query = value.trim().replace(/\s+/g, ' ');
    if (!query) {
      panel.classList.remove('show');
      panel.innerHTML = '';
      navigation.classList.remove('hide');
      updateSearchCount(visibleNoteCount, '');
      return;
    }
    var results = publishedNotes.filter(function (note) {
      return selectedCategory === 'all' || note.category === selectedCategory;
    }).map(function (note) { return searchHit(note, query); }).filter(Boolean);
    panel.innerHTML = results.length ? results.map(function (result) {
      var note = result.note;
      return '<a class="matching-post live-search-result" href="' + routeForNote(note.path) +
        '?find=' + encodeURIComponent(query) + '&scope=' + result.scope + '" data-preview="' + escapeHtml(result.preview) +
        '" data-query="' + escapeHtml(query) + '">' +
        '<h2>' + escapeHtml(note.title) + '</h2><p>' + escapeHtml(categoryLabels[note.category] || 'Reference & workflow') +
        ' · Jump to match</p><span class="search-result__inline">' + escapeHtml(result.preview) + '</span></a>';
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
      'Investigations': 'incident-response',
      'Digital forensics': 'digital-forensics',
      'Threat hunting': 'threat-hunting',
      'Detection engineering': 'detection-engineering',
      'Malware analysis': 'malware-analysis',
      'Cloud security': 'cloud-security',
      'OSINT': 'osint',
      'Pinned cheat sheets': 'cheat-sheets',
      'My tools': 'my-tools',
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

  function hideSearchPreview() {
    var preview = document.querySelector('.search-preview');
    if (preview) preview.hidden = true;
  }

  function previewText(textValue, query) {
    var at = textValue.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
    if (at < 0) return escapeHtml(textValue);
    return escapeHtml(textValue.slice(0, at)) + '<mark>' +
      escapeHtml(textValue.slice(at, at + query.length)) + '</mark>' +
      escapeHtml(textValue.slice(at + query.length));
  }

  function showSearchPreview(result) {
    if (!result || (window.matchMedia('(hover: none)').matches && document.activeElement !== result)) return;
    var preview = document.querySelector('.search-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.className = 'search-preview';
      preview.id = 'search-preview';
      preview.setAttribute('role', 'tooltip');
      document.body.appendChild(preview);
    }
    preview.innerHTML = '<strong>' + escapeHtml(result.querySelector('h2').textContent) +
      '</strong><p>' + previewText(result.dataset.preview || '', result.dataset.query || '') + '</p>';
    preview.hidden = false;
    var resultBox = result.getBoundingClientRect();
    var previewBox = preview.getBoundingClientRect();
    var left = resultBox.right + 12;
    if (left + previewBox.width > window.innerWidth - 8) left = resultBox.left - previewBox.width - 12;
    preview.style.left = Math.max(8, left) + 'px';
    preview.style.top = Math.max(8, Math.min(resultBox.top, window.innerHeight - previewBox.height - 8)) + 'px';
  }

  // Build a Range over visible passage text, including phrases split by inline
  // Markdown such as bold text or links. Whitespace is normalized for matching.
  function rangeInPassage(element, query) {
    var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    var positions = [];
    var textValue = '';
    var node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && node.parentElement.closest('button, script, style')) continue;
      for (var i = 0; i < node.nodeValue.length; i += 1) {
        var character = node.nodeValue[i];
        if (/\s/.test(character)) {
          if (!textValue || textValue.endsWith(' ')) continue;
          character = ' ';
        }
        textValue += character;
        positions.push({ node: node, offset: i });
      }
    }
    var matchAt = textValue.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
    if (matchAt < 0) return null;
    var first = positions[matchAt];
    var last = positions[matchAt + query.length - 1];
    if (!first || !last) return null;
    var range = document.createRange();
    range.setStart(first.node, first.offset);
    range.setEnd(last.node, last.offset + 1);
    return range;
  }

  function clearSearchJump(section) {
    section.querySelectorAll('.search-jump-target').forEach(function (element) {
      element.classList.remove('search-jump-target');
    });
    section.querySelectorAll('mark.search-jump-match').forEach(function (mark) {
      var parent = mark.parentNode;
      mark.replaceWith(document.createTextNode(mark.textContent));
      parent.normalize();
    });
    if (window.CSS && CSS.highlights) CSS.highlights.delete('note-search-match');
  }

  function jumpToSearchMatch() {
    var section = document.querySelector('.markdown-section');
    if (!section) return;
    clearSearchJump(section);
    var questionAt = window.location.hash.indexOf('?');
    if (questionAt < 0) return;
    var searchParams = new URLSearchParams(window.location.hash.slice(questionAt + 1));
    var query = searchParams.get('find');
    if (!query) return;
    query = query.trim().replace(/\s+/g, ' ');
    if (!query || query.length > 200) return;
    var candidates = Array.from(section.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, pre, td, th'))
      .filter(function (element) {
        return !element.closest('.workspace-bar') &&
          !(searchParams.get('scope') === 'body' && element.tagName === 'H1') &&
          !element.querySelector('p, li, pre, td, th');
      });
    var found = null;
    candidates.some(function (element) {
      var range = rangeInPassage(element, query);
      if (!range) return false;
      found = { element: element, range: range };
      return true;
    });
    if (!found) {
      section.querySelectorAll('.note-meta span').forEach(function (element) {
        if (!found) {
          var range = rangeInPassage(element, query);
          if (range) found = { element: element, range: range };
        }
      });
    }
    if (!found) {
      var heading = section.querySelector('h1');
      if (heading) found = { element: heading, range: null };
    }
    if (!found) return;
    found.element.classList.add('search-jump-target');
    if (found.range) {
      if (found.range.startContainer === found.range.endContainer) {
        var mark = document.createElement('mark');
        mark.className = 'search-jump-match';
        found.range.surroundContents(mark);
      } else if (window.CSS && CSS.highlights && window.Highlight) {
        CSS.highlights.set('note-search-match', new Highlight(found.range));
      }
    }
    var routeHash = window.location.hash;
    function alignMatch() {
      if (window.location.hash === routeHash && document.contains(found.element)) {
        found.element.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }
    window.setTimeout(alignMatch, 100);
    // Images above a match can change the page height after Docsify renders.
    // Realign once they have loaded so a deep match remains in view.
    var pendingImages = Array.from(section.querySelectorAll('img')).filter(function (image) {
      return !image.complete && Boolean(image.compareDocumentPosition(found.element) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    if (pendingImages.length) {
      var imagesSettled = Promise.all(pendingImages.map(function (image) {
        return new Promise(function (resolve) {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        });
      }));
      Promise.race([imagesSettled, new Promise(function (resolve) { window.setTimeout(resolve, 1800); })])
        .then(alignMatch);
    }
  }

  document.addEventListener('pointerover', function (event) {
    var result = event.target.closest('.live-search-result');
    if (result) showSearchPreview(result);
  });
  document.addEventListener('pointerout', function (event) {
    var result = event.target.closest('.live-search-result');
    if (result && !result.contains(event.relatedTarget)) hideSearchPreview();
  });
  document.addEventListener('focusin', function (event) {
    var result = event.target.closest('.live-search-result');
    if (result) showSearchPreview(result);
  });
  document.addEventListener('focusout', function (event) {
    if (event.target.closest('.live-search-result')) hideSearchPreview();
  });
  document.addEventListener('click', function (event) {
    if (event.target.closest('.live-search-result')) hideSearchPreview();
  });
  document.addEventListener('scroll', hideSearchPreview, true);
  window.addEventListener('resize', hideSearchPreview);
  window.addEventListener('hashchange', function () {
    // Docsify does not rerender when only a note's query string changes.
    if (window.location.hash.split('?')[0] === lastRenderedPath) {
      window.setTimeout(jumpToSearchMatch, 0);
    }
  });

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
        lastRenderedPath = window.location.hash.split('?')[0];
        jumpToSearchMatch();
      }, 0);
    });
  });
}());
