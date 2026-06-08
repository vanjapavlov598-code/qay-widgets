/* Section Loader — авто-высота iframe секций */
(function () {
  function resize(iframe) {
    try {
      var h = iframe.contentDocument.documentElement.scrollHeight;
      if (h > 50) iframe.style.height = h + 'px';
    } catch (e) {}
  }

  document.querySelectorAll('.sec-frame').forEach(function (iframe) {
    iframe.addEventListener('load', function () {
      resize(iframe);
      setTimeout(function () { resize(iframe); }, 600);
      setTimeout(function () { resize(iframe); }, 1400);
      try {
        new ResizeObserver(function () { resize(iframe); })
          .observe(iframe.contentDocument.body);
      } catch (e) {}
    });
  });
})();
