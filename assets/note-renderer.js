/* Shared Decap front matter handling for Docsify rendering and its search lexer. */
(function () {
  'use strict';
  var originalLexer = window.marked.lexer;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function localFilePath(value, pattern) {
    if (typeof value !== 'string' || !value.startsWith('/notes/files/') || value.length <= '/notes/files/'.length) return null;
    // Reject traversal before URL normalization, then validate the decoded path too.
    if (value.split(/[\\/]/).includes('..')) return null;
    try {
      var url = new URL(value, window.location.origin);
      var decodedPath = decodeURIComponent(url.pathname);
      if (url.origin !== window.location.origin || !url.pathname.startsWith('/notes/files/') ||
          !decodedPath.startsWith('/notes/files/') || decodedPath.split(/[\\/]/).includes('..') ||
          !pattern.test(url.pathname)) return null;
      return url.pathname;
    } catch (error) {
      return null;
    }
  }

  function pdfViewer(path, title) {
    var safePath = escapeHtml(path);
    var safeTitle = escapeHtml(title || 'PDF document');
    return '<section class="pdf-note" aria-label="' + safeTitle + '">' +
      '<div class="pdf-note__bar"><span class="pdf-note__label">Read-only PDF</span>' +
      '<span class="pdf-note__hint">Search inside the document with Ctrl+F / Cmd+F</span>' +
      '<a href="' + safePath + '" target="_blank" rel="noopener" data-no-router>Open</a>' +
      '<a href="' + safePath + '" download data-no-router>Download</a></div>' +
      '<iframe class="pdf-note__frame" title="' + safeTitle + '" loading="lazy" src="' + safePath + '#view=FitH"></iframe>' +
      '<p class="pdf-note__caption">This document is displayed as a PDF and cannot be edited in the notes editor. The searchable transcript below is indexed by this site.</p>' +
      '</section>';
  }

  function prepareNote(content) {
    var match = content.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) return content;
    var metadata;
    try { metadata = window.jsyaml.load(match[1], { schema: window.jsyaml.JSON_SCHEMA }); }
    catch (error) {
      console.warn('Invalid note metadata; showing the note body.');
      return '> Note metadata could not be read. Check the YAML header in GitHub.\n\n' + content.slice(match[0].length);
    }
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) metadata = {};
    var body = content.slice(match[0].length);
    var categoryNames = {
      'incident-response': 'Incident response',
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
    var statusNames = {
      'draft': 'Draft',
      'tested': 'Tested',
      'in-use': 'In use',
      'archived': 'Archived'
    };
    var tagNames = {
      'windows': 'Windows', 'microsoft-365': 'Microsoft 365', 'linux': 'Linux',
      'splunk': 'Splunk', 'sigma': 'Sigma', 'malware': 'Malware',
      'phishing': 'Phishing', 'azure': 'Azure', 'network': 'Network', 'edr': 'EDR'
    };
    var badges = [];
    if (typeof metadata.category === 'string' && categoryNames[metadata.category]) {
      badges.push('<span class="note-category note-category--' + metadata.category + '">' +
        escapeHtml(categoryNames[metadata.category]) + '</span>');
    }
    if (typeof metadata.status === 'string' && statusNames[metadata.status]) {
      badges.push('<span class="note-status note-status--' + metadata.status + '">' +
        escapeHtml(statusNames[metadata.status]) + '</span>');
    }
    if (Array.isArray(metadata.tags)) {
      metadata.tags.forEach(function (tag) {
        if (typeof tag === 'string' && tag.trim()) {
          badges.push('<span class="note-tag">' + escapeHtml(tagNames[tag] || tag) + '</span>');
        }
      });
    }
    if (badges.length) {
      body = '<div class="note-meta">' + badges.join('') + '</div>\n\n' + body;
    }
    var pdfPath = localFilePath(metadata.pdf, /\.pdf$/i);
    if (pdfPath) body = pdfViewer(pdfPath, metadata.title) + '\n\n' + body;
    // Tokenize the body so a "# heading" inside a code fence is not mistaken for H1.
    var hasHeading = originalLexer(body).some(function (token) {
      return token.type === 'heading' && token.depth === 1;
    });
    if (typeof metadata.title === 'string' && metadata.title.trim() && !hasHeading) {
      var title = escapeHtml(metadata.title.replace(/[\r\n]+/g, ' ')).replace(/([\\`*_{}\[\]()#+.!|~])/g, '\\$1');
      body = '# ' + title + '\n\n' + body;
    }
    if (typeof metadata.file === 'string') {
      var filePath = localFilePath(metadata.file, /.+/);
      if (filePath) {
        if (/\.(png|jpe?g|gif|webp|avif)$/i.test(filePath)) {
          body += '\n\n<p><img src="' + escapeHtml(filePath) + '" alt="Attached image" loading="lazy"></p>\n';
        }
        body += '\n\n<p><a data-no-router download href="' + escapeHtml(filePath) + '">Download attachment</a></p>\n';
      }
    }
    return body;
  }

  // The CDN search plugin reads raw Markdown without calling beforeEach.
  // Adapt the shared lexer as well so search titles/anchors match rendered notes.
  window.marked.lexer = function (content, options) {
    return originalLexer.call(this, prepareNote(content), options);
  };
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.beforeEach(prepareNote);
  });
}());
