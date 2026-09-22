/* Add a simple category tree to the Decap Notes collection screen. */
(function () {
  'use strict';

  var repository = 'AhmadAnasweh/AhmadAnasweh.github.io';
  var labels = {
    'incident-response': 'Investigations',
    'digital-forensics': 'Digital forensics',
    'threat-hunting': 'Threat hunting',
    'detection-engineering': 'Detection engineering',
    'malware-analysis': 'Malware analysis',
    'cloud-security': 'Cloud security',
    'osint': 'OSINT',
    'cheat-sheets': 'Pinned cheat sheets',
    'my-tools': 'My tools',
    'reference': 'Reference & workflow'
  };
  var order = [
    'incident-response', 'digital-forensics', 'threat-hunting',
    'detection-engineering', 'malware-analysis', 'cloud-security',
    'osint', 'cheat-sheets', 'my-tools', 'reference'
  ];
  var mounted = false;
  var notesPromise = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function metadata(content, fallback) {
    var match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    var title = fallback.replace(/\.md$/i, '').replace(/[-_]+/g, ' ');
    var category = 'reference';
    if (match) {
      var titleMatch = match[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
      var categoryMatch = match[1].match(/^category:\s*([\w-]+)/m);
      if (titleMatch && titleMatch[1]) title = titleMatch[1].replace(/^['"]|['"]$/g, '');
      if (categoryMatch && labels[categoryMatch[1]]) category = categoryMatch[1];
    }
    return { title: title, category: category };
  }

  function loadNotes() {
    if (notesPromise) return notesPromise;
    notesPromise = fetch('https://api.github.com/repos/' + repository + '/contents/notes?ref=main', {
      headers: { Accept: 'application/vnd.github+json' }
    }).then(function (response) {
      if (!response.ok) throw new Error('Unable to load note tree.');
      return response.json();
    }).then(function (files) {
      return Promise.all(files.filter(function (file) {
        return file.type === 'file' && /\.md$/i.test(file.name);
      }).map(function (file) {
        return fetch(file.download_url).then(function (response) {
          return response.text();
        }).then(function (content) {
          var note = metadata(content, file.name);
          note.slug = file.name.replace(/\.md$/i, '');
          return note;
        });
      }));
    });
    return notesPromise;
  }

  function collectionPage() {
    return /^#\/collections\/notes(?:\?.*)?$/.test(window.location.hash);
  }

  function mount() {
    if (!collectionPage()) {
      var old = document.querySelector('.notes-tree-toggle, .notes-tree-panel');
      if (old) old.remove();
      mounted = false;
      return;
    }
    if (mounted) return;
    mounted = true;

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'notes-tree-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span aria-hidden="true">⌘</span> Note tree';

    var panel = document.createElement('aside');
    panel.className = 'notes-tree-panel';
    panel.hidden = true;
    panel.innerHTML = '<div class="notes-tree-panel__head"><strong>Note tree</strong><button type="button" class="notes-tree-close" aria-label="Close note tree">×</button></div>' +
      '<p class="notes-tree-panel__hint">Browse published notes by category.</p><div class="notes-tree" aria-live="polite">Loading…</div>';
    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    function close() {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    panel.querySelector('.notes-tree-close').addEventListener('click', close);

    loadNotes().then(function (notes) {
      var groups = {};
      notes.forEach(function (note) { (groups[note.category] = groups[note.category] || []).push(note); });
      var tree = panel.querySelector('.notes-tree');
      tree.innerHTML = order.filter(function (category) { return groups[category] && groups[category].length; }).map(function (category) {
        var items = groups[category].sort(function (left, right) { return left.title.localeCompare(right.title); });
        return '<details open><summary><span class="notes-tree-folder" aria-hidden="true">▾</span>' + escapeHtml(labels[category]) + '<small>' + items.length + '</small></summary>' +
          '<ul>' + items.map(function (note) {
            return '<li><a href="#/collections/notes/entries/' + encodeURIComponent(note.slug) + '">' + escapeHtml(note.title) + '</a></li>';
          }).join('') + '</ul></details>';
      }).join('') || '<p class="notes-tree__empty">No published notes found.</p>';
    }).catch(function () {
      panel.querySelector('.notes-tree').innerHTML = '<p class="notes-tree__empty">The tree is unavailable. Use the normal collection list.</p>';
    });
  }

  window.addEventListener('hashchange', mount);
  new MutationObserver(mount).observe(document.body, { childList: true, subtree: true });
  mount();
}());
