/* Keep titles as plain strings while making emoji easy to insert. */
(function () {
  'use strict';

  var h = window.h;
  var emojis = [
    ['📝', 'memo notes'], ['✍️', 'writing pen'], ['📚', 'books study'], ['📖', 'open book'],
    ['📄', 'document'], ['📌', 'pin'], ['🗂️', 'files folders'], ['🗒️', 'notepad'],
    ['💡', 'idea'], ['🧠', 'brain thinking'], ['🎯', 'target goal'], ['🧩', 'puzzle'],
    ['🛠️', 'tools'], ['⚙️', 'settings gear'], ['🔍', 'search investigation'],
    ['🕵️', 'detective'], ['🛡️', 'shield defense'], ['🔐', 'secure lock'],
    ['🔒', 'locked'], ['🔑', 'key'], ['🚨', 'alert siren'], ['⚠️', 'warning'],
    ['🧪', 'lab test'], ['🧬', 'forensics dna'], ['🦠', 'malware virus'],
    ['💻', 'laptop'], ['🖥️', 'desktop computer'], ['📱', 'phone mobile'],
    ['🌐', 'web globe'], ['☁️', 'cloud'], ['🕸️', 'network web'],
    ['📡', 'antenna signal'], ['🛰️', 'satellite'], ['🗃️', 'archive files'],
    ['💾', 'disk save'], ['🧱', 'firewall brick'], ['✅', 'done check'],
    ['☑️', 'check box'], ['❌', 'no cross'], ['❗', 'important'], ['❓', 'question'],
    ['🚀', 'rocket launch'], ['⚡', 'lightning fast'], ['🔥', 'fire hot'],
    ['⭐', 'star favorite'], ['🌟', 'glowing star'], ['💎', 'gem'], ['🏆', 'trophy'],
    ['🎉', 'celebration'], ['👀', 'eyes look'], ['📈', 'growth chart'],
    ['📉', 'decline chart'], ['⏱️', 'timer'], ['🕒', 'clock time'],
    ['🧭', 'compass'], ['🗺️', 'map'], ['🌍', 'world earth'], ['🌙', 'moon night'],
    ['☀️', 'sun'], ['🌈', 'rainbow'], ['🐛', 'bug'], ['🐍', 'python snake'],
    ['🦊', 'fox'], ['🤖', 'robot'], ['👾', 'alien game'], ['🎲', 'dice'],
    ['🎨', 'art palette'], ['❤️', 'heart love'], ['💙', 'blue heart'],
    ['💚', 'green heart'], ['😀', 'smile happy'], ['😎', 'cool']
  ];
  var stringWidget = window.CMS.getWidget('string');

  var Control = window.createClass({
    getInitialState: function () { return { open: false, query: '' }; },
    insertEmoji: function (emoji) {
      var input = this.input;
      var value = typeof this.props.value === 'string' ? this.props.value : '';
      var start = input ? input.selectionStart : value.length;
      var end = input ? input.selectionEnd : value.length;
      var separator = start === 0 || /\s$/.test(value.slice(0, start)) ? '' : ' ';
      var inserted = emoji + (end < value.length || !value ? ' ' : '');
      this.props.onChange(value.slice(0, start) + separator + inserted + value.slice(end));
      this.setState({ open: false, query: '' });
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
      var query = this.state.query.trim().toLowerCase();
      var matches = emojis.filter(function (item) {
        return !query || item[0].indexOf(query) >= 0 || item[1].indexOf(query) >= 0;
      });
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
            onClick: function () { self.setState({ open: !self.state.open, query: '' }); }
          }, '😀 Emoji')
        ),
        this.state.open && h('div', { className: 'emoji-title__picker', role: 'group', 'aria-label': 'Title emoji choices' },
          h('input', {
            type: 'search', className: 'emoji-title__search',
            'aria-label': 'Search title emojis', placeholder: 'Search emojis (for example: shield or lab)',
            value: this.state.query,
            onChange: function (event) { self.setState({ query: event.target.value }); }
          }),
          h('div', { className: 'emoji-title__choices' },
            matches.map(function (item) {
              return h('button', {
                key: item[0], type: 'button', className: 'emoji-title__choice',
                'aria-label': 'Insert ' + item[0] + ' (' + item[1] + ')',
                title: item[1],
                onMouseDown: function (event) { event.preventDefault(); },
                onClick: function () { self.insertEmoji(item[0]); }
              }, item[0]);
            }),
            !matches.length && h('span', { className: 'emoji-title__empty' }, 'No matches. You can type any emoji in the title.')
          )
        )
      );
    }
  });

  window.CMS.registerWidget('emoji_title', Control, stringWidget.preview, stringWidget.schema);
}());
