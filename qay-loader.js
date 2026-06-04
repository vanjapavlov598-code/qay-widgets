/**
 * QaY Widget Loader — Custom Element
 * Загружает HTML с GitHub Pages и вставляет в DOM страницы
 * Google читает контент как часть основной страницы
 *
 * Использование в Wix Custom Element:
 * <qay-widget src="https://vanjapavlov598-code.github.io/qay-widgets/neustadt-hero-dom.html"></qay-widget>
 */
class QayWidget extends HTMLElement {
  async connectedCallback() {
    const url = this.getAttribute('src');
    if (!url) return;

    try {
      const resp = await fetch(url, { cache: 'no-cache' });
      const html = await resp.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Загружаем Google Fonts если есть
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (!document.querySelector(`link[href="${link.href}"]`)) {
          document.head.appendChild(link.cloneNode(true));
        }
      });

      // Инжектируем стили с фильтрацией html/body правил
      doc.querySelectorAll('style').forEach(style => {
        const scoped = document.createElement('style');
        scoped.textContent = style.textContent
          .replace(/\bhtml\b/g, '[data-qay]')
          .replace(/\bbody\b/g, '[data-qay]');
        this.appendChild(scoped);
      });

      // Вставляем тело в Light DOM (не Shadow DOM — Google читает)
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-qay', '');
      wrapper.innerHTML = doc.body.innerHTML;
      this.appendChild(wrapper);

    } catch (e) {
      console.warn('QaY Widget load error:', e);
    }
  }
}

customElements.define('qay-widget', QayWidget);
