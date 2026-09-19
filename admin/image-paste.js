/* A stable Markdown textarea for long notes, rich pastes, and image uploads. */
(function () {
  'use strict';

  var markdown = window.CMS.getWidget('markdown');
  var h = window.h;
  var supported = {
    'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif',
    'image/webp': 'webp', 'image/avif': 'avif'
  };

  function clipboardMarkdown(html) {
    if (!window.TurndownService) return null;
    var documentFromClipboard = new DOMParser().parseFromString(html, 'text/html');
    var body = documentFromClipboard.body;
    body.querySelectorAll('script, style, iframe, object, embed, form, noscript').forEach(function (node) {
      node.remove();
    });
    var textLength = body.textContent.trim().length;
    var imageCount = body.querySelectorAll('img').length;
    body.querySelectorAll('img').forEach(function (image) {
      var source = image.getAttribute('src') || image.getAttribute('data-src') || '';
      if (!/^(https?:\/\/|\/)/i.test(source)) image.remove();
      else image.setAttribute('src', source.replace(/\(/g, '%28').replace(/\)/g, '%29'));
    });
    body.querySelectorAll('a').forEach(function (link) {
      var destination = link.getAttribute('href') || '';
      if (destination && !/^(https?:\/\/|\/|#|mailto:)/i.test(destination)) link.removeAttribute('href');
    });
    var converter = new window.TurndownService({
      headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-'
    });
    return { text: converter.turndown(body).trim(), textLength: textLength, imageCount: imageCount };
  }

  var Control = window.createClass({
    getInitialState: function () {
      return {
        busy: false, dragging: false, message: '',
        autosave: window.notesDraftAutosave && window.notesDraftAutosave.status ||
          'Drafts save every 5 minutes without publishing.'
      };
    },
    componentDidMount: function () {
      this.currentValue = typeof this.props.value === 'string' ? this.props.value : '';
      var self = this;
      this.autosaveListener = function (event) { self.setState({ autosave: event.detail }); };
      document.addEventListener('notes-autosave', this.autosaveListener);
    },
    componentWillUnmount: function () {
      document.removeEventListener('notes-autosave', this.autosaveListener);
    },
    componentWillReceiveProps: function (nextProps) {
      if (nextProps.value !== this.props.value && nextProps.value !== this.currentValue) {
        this.currentValue = typeof nextProps.value === 'string' ? nextProps.value : '';
      }
    },
    selection: function () {
      var editor = this.editor;
      return {
        start: editor ? editor.selectionStart : 0,
        end: editor ? editor.selectionEnd : 0,
        scroll: editor ? editor.scrollTop : 0,
        focused: editor === document.activeElement
      };
    },
    changeValue: function (value, selection) {
      this.currentValue = value;
      this.props.onChange(value);
      if (!selection) return;
      var self = this;
      window.requestAnimationFrame(function () {
        if (!self.editor) return;
        self.editor.setSelectionRange(selection.start, selection.end);
        self.editor.scrollTop = selection.scroll;
        if (selection.focused) self.editor.focus({ preventScroll: true });
      });
    },
    insertText: function (text, selection) {
      selection = selection || this.selection();
      var current = this.currentValue || '';
      var value = current.slice(0, selection.start) + text + current.slice(selection.end);
      var caret = selection.start + text.length;
      this.changeValue(value, { start: caret, end: caret, scroll: selection.scroll, focused: true });
    },
    replaceToken: function (token, replacement) {
      var current = this.currentValue || '';
      var position = current.indexOf(token);
      if (position < 0) return;
      var selection = this.selection();
      var difference = replacement.length - token.length;
      function adjust(offset) { return offset > position ? Math.max(position, offset + difference) : offset; }
      this.changeValue(
        current.slice(0, position) + replacement + current.slice(position + token.length),
        { start: adjust(selection.start), end: adjust(selection.end), scroll: selection.scroll, focused: selection.focused }
      );
    },
    handleChange: function (event) {
      this.currentValue = event.target.value;
      this.props.onChange(event.target.value);
    },
    handlePaste: function (event) {
      var clipboard = event.clipboardData;
      if (!clipboard) return;
      var files = Array.from(clipboard.files || []).filter(function (file) {
        return file.type.indexOf('image/') === 0;
      });
      var html = clipboard.getData('text/html');
      if (html) {
        try {
          var converted = clipboardMarkdown(html);
          var imageOnlyFile = files.length && converted && !converted.textLength && converted.imageCount <= 1;
          if (converted && converted.text && !imageOnlyFile) {
            event.preventDefault();
            this.insertText(converted.text);
            this.setState({ message: 'Article pasted as Markdown, including text after its images.' });
            return;
          }
        } catch (error) {
          // The native textarea can still paste all plain text if conversion fails.
          console.warn('Rich paste conversion failed; using plain text.', error);
        }
      }
      if (files.length) {
        event.preventDefault();
        this.addImages(files, this.selection());
      }
    },
    handleDrop: function (event) {
      var files = Array.from(event.dataTransfer && event.dataTransfer.files || []).filter(function (file) {
        return file.type.indexOf('image/') === 0;
      });
      if (!files.length) return;
      event.preventDefault();
      this.setState({ dragging: false });
      this.addImages(files, this.selection());
    },
    handleDragOver: function (event) {
      if (Array.from(event.dataTransfer && event.dataTransfer.types || []).indexOf('Files') < 0) return;
      event.preventDefault();
      if (!this.state.dragging) this.setState({ dragging: true });
    },
    handleDragLeave: function () {
      if (this.state.dragging) this.setState({ dragging: false });
    },
    addImages: async function (files, selection) {
      if (this.uploading || this.props.isDisabled || !files.length) return;
      for (var file of files) {
        if (!supported[file.type]) {
          this.setState({ message: 'Choose a PNG, JPEG, GIF, WebP, or AVIF image.' });
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          this.setState({ message: 'This image is over 10 MB. Resize or compress it first.' });
          return;
        }
      }
      this.uploading = true;
      window.__notesImageUploads = (window.__notesImageUploads || 0) + 1;
      this.setState({ busy: true, message: 'Adding image...' });
      var tokens = files.map(function () {
        return '<!-- uploading-image-' + window.crypto.randomUUID() + ' -->';
      });
      this.insertText(tokens.join('\n\n'), selection);
      try {
        for (var index = 0; index < files.length; index++) {
          var currentFile = files[index];
          var name = 'image-' + Date.now() + '-' + window.crypto.randomUUID().slice(0, 8) + '.' + supported[currentFile.type];
          var upload = new File([currentFile], name, { type: currentFile.type });
          var result = await this.props.onPersistMedia(upload, { field: this.props.field });
          if (!result || !result.payload || !result.payload.path || /FAILURE/.test(result.type)) {
            throw new Error('The image could not be added. Try again.');
          }
          var path = '/' + result.payload.path.replace(/^\/+/, '');
          this.replaceToken(tokens[index], '![Screenshot](' + path + ')');
        }
        this.setState({ message: 'Image added at the cursor. An unpublished draft will save shortly.' });
        if (window.notesDraftAutosave) window.notesDraftAutosave.scheduleSoon();
      } catch (error) {
        for (var remaining = 0; remaining < tokens.length; remaining++) {
          this.replaceToken(tokens[remaining], '');
        }
        this.setState({ message: error.message || 'Unable to add the image.' });
      } finally {
        this.uploading = false;
        window.__notesImageUploads = Math.max(0, (window.__notesImageUploads || 1) - 1);
        this.setState({ busy: false });
      }
    },
    wrapSelection: function (before, after, placeholder) {
      var selected = this.selection();
      var value = this.currentValue || '';
      var middle = value.slice(selected.start, selected.end) || placeholder;
      this.insertText(before + middle + after, selected);
      var self = this;
      window.requestAnimationFrame(function () {
        if (!self.editor) return;
        self.editor.setSelectionRange(selected.start + before.length, selected.start + before.length + middle.length);
      });
    },
    addHeading: function () {
      var selected = this.selection();
      var value = this.currentValue || '';
      var lineStart = value.lastIndexOf('\n', selected.start - 1) + 1;
      this.insertText('## ', { start: lineStart, end: lineStart, scroll: selected.scroll, focused: true });
    },
    jump: function (toEnd) {
      if (!this.editor) return;
      this.editor.focus({ preventScroll: true });
      var position = toEnd ? (this.currentValue || '').length : 0;
      this.editor.setSelectionRange(position, position);
      this.editor.scrollTop = toEnd ? this.editor.scrollHeight : 0;
    },
    render: function () {
      var self = this;
      var value = typeof this.props.value === 'string' ? this.props.value : '';
      var wordCount = (value.match(/\S+/g) || []).length;
      function tool(label, action) {
        return h('button', {
          type: 'button', className: 'note-editor__tool', disabled: self.props.isDisabled,
          onMouseDown: function (event) { event.preventDefault(); }, onClick: action
        }, label);
      }
      return h('div', { className: 'note-editor' + (this.state.dragging ? ' note-editor--dragging' : '') },
        h('div', { className: 'note-editor__toolbar' },
          tool('Bold', function () { self.wrapSelection('**', '**', 'bold text'); }),
          tool('Heading', function () { self.addHeading(); }),
          tool('Link', function () { self.wrapSelection('[', '](https://)', 'link text'); }),
          tool('Code', function () {
            var tick = String.fromCharCode(96);
            self.wrapSelection(tick, tick, 'code');
          }),
          h('button', {
            type: 'button', className: 'note-editor__tool note-editor__tool--accent',
            disabled: this.state.busy || this.props.isDisabled,
            onMouseDown: function (event) { event.preventDefault(); },
            onClick: function () { self.pendingSelection = self.selection(); self.fileInput.click(); }
          }, this.state.busy ? 'Adding image...' : 'Add image'),
          h('span', { className: 'note-editor__toolbar-spacer' }),
          tool('Top', function () { self.jump(false); }),
          tool('Bottom', function () { self.jump(true); })
        ),
        h('textarea', {
          id: this.props.forID, className: 'note-editor__body', value: value,
          'aria-label': 'Note body in Markdown', rows: 24, spellCheck: true,
          disabled: this.props.isDisabled,
          ref: function (node) { self.editor = node; },
          onChange: this.handleChange, onPaste: this.handlePaste,
          onDrop: this.handleDrop, onDragOver: this.handleDragOver, onDragLeave: this.handleDragLeave
        }),
        h('input', {
          type: 'file', accept: 'image/png,image/jpeg,image/gif,image/webp,image/avif',
          multiple: true, style: { display: 'none' },
          ref: function (node) { self.fileInput = node; },
          onChange: function (event) {
            var files = Array.from(event.target.files || []);
            event.target.value = '';
            self.addImages(files, self.pendingSelection || self.selection());
            self.pendingSelection = null;
          }
        }),
        h('div', { className: 'note-editor__footer' },
          h('span', null, wordCount + ' words · Paste full articles or images directly here.'),
          h('span', { role: 'status', 'aria-live': 'polite' }, this.state.message),
          h('span', { className: 'note-editor__autosave' }, this.state.autosave)
        )
      );
    }
  });

  window.CMS.registerWidget('markdown', Control, markdown.preview, markdown.schema);
}());
