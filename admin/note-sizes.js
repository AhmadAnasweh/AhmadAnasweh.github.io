/* Show the published Markdown file size beside each note in Decap's list. */
(function () {
  'use strict';

  var sizes = null;
  var loading = false;
  var scheduled = false;
  var fallbackRequests = Object.create(null);
  var entryLinkSelector = 'a[href*="/collections/notes/entries/"]';

  function onNotesList() {
    return /^#\/collections\/notes(?:\?.*)?$/.test(window.location.hash);
  }

  function slugFromLink(link) {
    var href = link.getAttribute('href') || '';
    var marker = '/collections/notes/entries/';
    var index = href.indexOf(marker);
    if (index < 0) return null;
    var slug = href.slice(index + marker.length).split(/[/?#]/)[0];
    try { return decodeURIComponent(slug); }
    catch (error) { return null; }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function setSize(link, bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return;
    var label = link.querySelector('.note-file-size');
    if (!label) {
      label = document.createElement('span');
      label.className = 'note-file-size';
      link.appendChild(label);
    }
    var text = 'Size ' + formatSize(bytes);
    if (label.textContent !== text) label.textContent = text;
    label.title = 'Markdown file size: ' + bytes.toLocaleString() + ' bytes';
  }

  function loadFromPublishedSite(slug) {
    if (fallbackRequests[slug]) return;
    fallbackRequests[slug] = fetch('/notes/' + encodeURIComponent(slug) + '.md')
      .then(function (response) {
        if (!response.ok) throw new Error('Note is not published yet.');
        return response.arrayBuffer();
      })
      .then(function (data) {
        sizes[slug + '.md'] = data.byteLength;
        scheduleRender();
      })
      .catch(function () { /* New or unpublished notes have no public file size. */ });
  }

  function render() {
    scheduled = false;
    if (!onNotesList() || !sizes) return;
    document.querySelectorAll(entryLinkSelector).forEach(function (link) {
      var slug = slugFromLink(link);
      if (!slug) return;
      var bytes = sizes[slug + '.md'];
      if (Number.isFinite(bytes)) setSize(link, bytes);
      else if (sizes.__fallback) loadFromPublishedSite(slug);
    });
  }

  function scheduleRender() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(render);
  }

  function loadSizes() {
    if (loading || sizes || !onNotesList()) return;
    loading = true;
    fetch('https://api.github.com/repos/AhmadAnasweh/AhmadAnasweh.github.io/contents/notes?ref=main', {
      headers: { Accept: 'application/vnd.github+json' }
    }).then(function (response) {
      if (!response.ok) throw new Error('Could not load note sizes.');
      return response.json();
    }).then(function (files) {
      if (!Array.isArray(files)) throw new Error('Invalid note list.');
      sizes = Object.create(null);
      files.forEach(function (file) {
        if (file.type === 'file' && /\.md$/i.test(file.name) && Number.isFinite(file.size)) {
          sizes[file.name] = file.size;
        }
      });
      scheduleRender();
    }).catch(function () {
      // GitHub's public API can be rate limited; the published notes still work.
      sizes = { __fallback: true };
      scheduleRender();
    });
  }

  window.addEventListener('hashchange', function () {
    loadSizes();
    scheduleRender();
  });
  new MutationObserver(function () {
    if (!onNotesList()) return;
    loadSizes();
    scheduleRender();
  }).observe(document.body, { childList: true, subtree: true });
  loadSizes();
}());
