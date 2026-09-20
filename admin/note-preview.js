/* Render an editor preview that resembles the public notebook. */
(function () {
  'use strict';
  var h = window.h;
  var labels = {
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

  var NotePreview = window.createClass({
    render: function () {
      var entry = this.props.entry;
      var title = entry.getIn(['data', 'title']) || 'Untitled note';
      var category = entry.getIn(['data', 'category']) || 'reference';
      var status = entry.getIn(['data', 'status']) || 'draft';
      return h('article', { className: 'note-preview' },
        h('div', { className: 'note-preview__eyebrow' }, 'FIELD NOTE PREVIEW'),
        h('div', { className: 'note-preview__meta' },
          h('span', null, labels[category] || category),
          h('span', null, status.replace(/-/g, ' '))
        ),
        h('h1', null, title),
        h('div', { className: 'note-preview__body' }, this.props.widgetFor('body'))
      );
    }
  });

  window.CMS.registerPreviewTemplate('notes', NotePreview);
  window.CMS.registerPreviewStyle('/admin/preview.css');
}());
