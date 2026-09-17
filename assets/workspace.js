/* Keeps Docsify navigation responsive when several internal links are clicked quickly. */
(function () {
  'use strict';
  var queuedRoute = null;
  var routeTimer = null;
  var queueDelay = 90;

  function internalRoute(link) {
    if (!link || link.hasAttribute('data-no-router') || link.target || link.hasAttribute('download')) return null;
    var href = link.getAttribute('href') || '';
    if (href.indexOf('#/') === 0) return href;
    if (href.charAt(0) === '/' && href.indexOf('//') !== 0) return '#' + href;
    return null;
  }

  function clearPending() {
    if (!routeTimer) document.documentElement.classList.remove('route-pending');
  }

  function navigateToLatest() {
    var route = queuedRoute;
    queuedRoute = null;
    routeTimer = null;
    if (route && window.location.hash !== route) window.location.hash = route.slice(1);
    clearPending();
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest && event.target.closest('a');
    var route = internalRoute(link);
    if (!route || route === window.location.hash) return;

    // Docsify renders asynchronously. Coalescing a burst gives the last click
    // priority and avoids stale renders taking over the page.
    event.preventDefault();
    event.stopImmediatePropagation();
    queuedRoute = route;
    document.documentElement.classList.add('route-pending');
    if (routeTimer) window.clearTimeout(routeTimer);
    routeTimer = window.setTimeout(navigateToLatest, queueDelay);
  }, true);

  function mountWorkspaceBar() {
    var section = document.querySelector('.markdown-section');
    if (!section || section.querySelector('.workspace-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'workspace-bar';
    bar.innerHTML = '<span class="workspace-bar__badge">Field notebook</span><span class="workspace-bar__divider" aria-hidden="true"></span><span>Read, search, and capture what matters.</span><a class="workspace-bar__edit" href="/admin/" data-no-router>Write a note</a>';
    section.insertBefore(bar, section.firstChild);
  }

  function mountProfileLogo() {
    if (document.querySelector('.profile-logo')) return;
    var logo = document.createElement('button');
    logo.className = 'profile-logo';
    logo.type = 'button';
    logo.setAttribute('aria-label', 'Expand personal logo');
    logo.setAttribute('aria-expanded', 'false');
    logo.innerHTML = '<img src="/assets/me.png" alt="Ahmad\'s personal logo">';
    document.body.appendChild(logo);

    function closeLogo() {
      logo.classList.remove('profile-logo--expanded');
      logo.setAttribute('aria-expanded', 'false');
    }

    logo.addEventListener('click', function (event) {
      event.stopPropagation();
      var expanded = logo.classList.toggle('profile-logo--expanded');
      logo.setAttribute('aria-expanded', String(expanded));
    });
    document.addEventListener('click', function (event) {
      if (!logo.contains(event.target)) closeLogo();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeLogo();
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      window.setTimeout(function () {
        mountWorkspaceBar();
        mountProfileLogo();
        clearPending();
      }, 0);
    });
  });
}());
