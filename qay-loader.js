class QayWidget extends HTMLElement {

  static get observedAttributes() { return ['src']; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'src' && newVal && newVal !== oldVal) {
      this.load(newVal);
    }
  }

  connectedCallback() {
    const url = this.getAttribute('src');
    if (url) this.load(url);
  }

  async load(url) {
    try {
      const resp = await fetch(url, { cache: 'no-cache' });
      const html = await resp.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Google Fonts
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (!document.querySelector(`link[href="${link.href}"]`)) {
          document.head.appendChild(link.cloneNode(true));
        }
      });

      // CSS — заменяем html/body на [data-qay]
      doc.querySelectorAll('style').forEach(style => {
        const s = document.createElement('style');
        s.textContent = style.textContent
          .replace(/\bhtml\b/g, '[data-qay]')
          .replace(/\bbody\b/g, '[data-qay]');
        this.appendChild(s);
      });

      // Контент в Light DOM
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-qay', '');
      wrapper.innerHTML = doc.body.innerHTML;
      this.appendChild(wrapper);

      // Запускаем скрипты
      wrapper.querySelectorAll('script').forEach(old => {
        const s = document.createElement('script');
        s.textContent = old.textContent;
        old.replaceWith(s);
      });

    } catch(e) {
      console.warn('QaY loader error:', e);
    }
  }
}

customElements.define('qay-widget', QayWidget);
