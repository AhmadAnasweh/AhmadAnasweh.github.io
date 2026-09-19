/* Keep titles as plain strings while making emoji easy to insert. */
(function () {
  'use strict';

  var h = window.h;
  var emojis = ['📝', '🔍', '🛡️', '🔐', '🧪', '🚨', '💡', '⚡', '📌', '🧩', '🌐', '📂'];
  var stringWidget = window.CMS.getWidget('string');

  var Control = window.createClass({
    getInitialState: function () { return { open: false }; },
    insertEmoji: function (emoji) {
      var input = this.input;
      var value = typeof this.props.value === 'string' ? this.props.value : '';
      var start = input ? input.selectionStart : value.length;
      var end = input ? input.selectionEnd : value.length;
      var separator = start === 0 || /\s$/.test(value.slice(0, start)) ? '' : ' ';
      var inserted = emoji + (end < value.length || !value ? ' ' : '');
      this.props.onChange(value.slice(0, start) + separator + inserted + value.slice(end));
      this.setState({ open: false });
      var self = this;
      window.requestAnimationFrame(function () {
        if (!self.input) return;
        self.input.focus({ preventScroll: true });
        var cursor = start + separator.length + inserted.length;
        self.input.setSelectionRange(cursor, cursor);
      });
    },
    render: function () {
      var self = this;
      return h('div', { className: 'emoji-title' },
        h('div', { className: 'emoji-title__row' },
          h('input', {
            id: this.props.forID, type: 'text', className: 'emoji-title__input',
            value: typeof this.props.value === 'string' ? this.props.value : '',
            disabled: this.props.isDisabled,
            ref: function (node) { self.input = node; },
            onChange: function (event) { self.props.onChange(event.target.value); }
          }),
          h('button', {
            type: 'button', className: 'emoji-title__toggle',
            'aria-label': 'Choose emoji for note title',
            'aria-expanded': this.state.open,
            disabled: this.props.isDisabled,
            onMouseDown: function (event) { event.preventDefault(); },
            onClick: function () { self.setState({ open: !self.state.open }); }
          }, '😀 Emoji')
        ),
        this.state.open && h('div', { className: 'emoji-title__picker', role: 'group', 'aria-label': 'Title emoji choices' },
          emojis.map(function (emoji) {
            return h('button', {
              key: emoji, type: 'button', className: 'emoji-title__choice',
              'aria-label': 'Insert ' + emoji,
              onMouseDown: function (event) { event.preventDefault(); },
              onClick: function () { self.insertEmoji(emoji); }
            }, emoji);
          })
        )
      );
    }
  });

  window.CMS.registerWidget('emoji_title', Control, stringWidget.preview, stringWidget.schema);
}());
