/* Decap 3 treats /notes/files/... as a URL; map it to its draft asset key instead. */
(function () {
  'use strict';
  var h = window.h;

  function resolveDraftAssets(Component) {
    if (!Component) return Component;
    return window.createClass({
      render: function () {
        var getAsset = this.props.getAsset;
        if (typeof getAsset !== 'function') return h(Component, this.props);
        return h(Component, Object.assign({}, this.props, {
          getAsset: function (assetPath, field) {
            // Preserve the root-relative URL in saved Markdown. Only the CMS's
            // lookup uses the repository path, so unpublished blobs are found.
            if (typeof assetPath === 'string' && assetPath.indexOf('/notes/files/') === 0) {
              assetPath = assetPath.slice(1);
            }
            return getAsset(assetPath, field);
          }
        }));
      }
    });
  }

  ['markdown', 'image', 'file'].forEach(function (name) {
    var widget = window.CMS.getWidget(name);
    window.CMS.registerWidget(name, resolveDraftAssets(widget.control), resolveDraftAssets(widget.preview), widget.schema);
  });
}());
