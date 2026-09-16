/* Keep Decap's Markdown editor and add clipboard/file images through its media API. */
(function () {
  'use strict';
  var markdown = window.CMS.getWidget('markdown');
  var h = window.h;
  var supported = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif' };
  var Control = window.createClass({
    getInitialState: function () { return { revision: 0, busy: false, message: '' }; },
    handlePaste: function (event) {
      var files = Array.from(event.clipboardData && event.clipboardData.files || []);
      if (!files.some(function (file) { return file.type.indexOf('image/') === 0; })) return;
      event.preventDefault();
      event.stopPropagation();
      this.addImages(files);
    },
    addImages: async function (files) {
      if (this.uploading || this.props.isDisabled || !files.length) return;
      this.uploading = true;
      this.setState({ busy: true, message: 'Adding image...' });
      try {
        for (var file of files) {
          if (!supported[file.type]) throw new Error('Choose a PNG, JPEG, GIF, WebP, or AVIF image.');
          if (file.size > 10 * 1024 * 1024) throw new Error('This image is over 10 MB. Resize or compress it, then try again.');
        }
        var links = [];
        for (var file of files) {
          var name = 'image-' + Date.now() + '-' + window.crypto.randomUUID().slice(0, 8) + '.' + supported[file.type];
          var upload = new File([file], name, { type: file.type });
          // Decap queues the asset on the draft, then commits it when Publish is clicked.
          var result = await this.props.onPersistMedia(upload, { field: this.props.field });
          if (!result || !result.payload || !result.payload.path || /FAILURE/.test(result.type)) {
            throw new Error('The image could not be added. Try again and check the editor notification.');
          }
          var assetPath = '/' + result.payload.path.replace(/^\/+/, '');
          links.push('![Screenshot](' + assetPath + ')');
        }
        // Append intentionally: preserves existing text and works in both editor modes.
        this.props.onChange((this.props.value || '').replace(/\s*$/, '') + '\n\n' + links.join('\n\n') + '\n');
        this.setState({ revision: this.state.revision + 1, message: 'Image added at the end of the note. Publish to save it.' });
      } catch (error) {
        this.setState({ message: error.message || 'Unable to add image.' });
      } finally {
        this.uploading = false;
        this.setState({ busy: false });
      }
    },
    render: function () {
      var self = this;
      return h('div', { onPasteCapture: this.handlePaste },
        h('div', { style: { padding: '10px 12px', background: '#edf6f4', color: '#173c36', borderRadius: '4px', marginBottom: '8px' } },
          h('button', { type: 'button', disabled: this.state.busy || this.props.isDisabled, onClick: function () { self.fileInput.click(); }, style: { padding: '6px 12px', marginRight: '10px', cursor: 'pointer' } }, 'Add image'),
          h('span', null, 'Paste a copied image into Body with Ctrl+V (Mac: Cmd+V). Images are added at the end.'),
          h('input', { ref: function (node) { self.fileInput = node; }, type: 'file', accept: 'image/png,image/jpeg,image/gif,image/webp,image/avif', multiple: true, style: { display: 'none' }, onChange: function (event) { self.addImages(Array.from(event.target.files)); event.target.value = ''; } }),
          h('p', { role: 'status', 'aria-live': 'polite', style: { margin: '6px 0 0' } }, this.state.message)
        ),
        h(markdown.control, Object.assign({}, this.props, { key: this.state.revision }))
      );
    }
  });
  window.CMS.registerWidget('markdown', Control, markdown.preview, markdown.schema);
}());
