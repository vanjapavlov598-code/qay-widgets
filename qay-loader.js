class QayWidget extends HTMLElement {

  static get observedAttributes() { return ['src']; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'src' && newVal && newVal !== oldVal) this.load(newVal);
  }

  connectedCallback() {
    const url = this.getAttribute('src');
    if (url) this.load(url);
  }

  async load(url) {
    if (this._loaded) return;
    this._loaded = true;

    try {
      const resp = await fetch(url, { cache: 'no-cache' });
      const html = await resp.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // ── 1. SEO: key text in Light DOM (Google reads this) ──
      const seoDiv = document.createElement('div');
      seoDiv.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';

      // Extract H1, H2, paragraphs for SEO
      ['h1','h2','p'].forEach(tag => {
        doc.querySelectorAll(tag).forEach(el => {
          const clone = document.createElement(tag);
          clone.textContent = el.textContent;
          seoDiv.appendChild(clone);
        });
      });
      this.appendChild(seoDiv);

      // ── 2. Visual: Shadow DOM (CSS isolated from Wix) ──
      const shadow = this.attachShadow({ mode: 'open' });

      // Google Fonts in shadow
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400;500&display=swap';
      shadow.appendChild(fontLink);

      // Styles
      doc.querySelectorAll('style').forEach(style => {
        const s = document.createElement('style');
        s.textContent = style.textContent;
        shadow.appendChild(s);
      });

      // Content
      const wrapper = document.createElement('div');
      wrapper.innerHTML = doc.body.innerHTML;
      shadow.appendChild(wrapper);

      // Run scripts inside shadow context
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
