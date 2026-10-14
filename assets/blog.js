// Keep the CMS article formatting while discarding executable markup.
function renderArticleHTML(html, container) {
  const source = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['P', 'DIV', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'DEL', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE', 'A', 'IMG', 'BR', 'HR', 'FIGURE', 'FIGCAPTION', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD']);
  const blocked = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'SVG', 'MATH', 'TEMPLATE']);
  function safeAddress(raw) {
    try {
      const url = new URL(raw, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? raw : '';
    } catch { return ''; }
  }
  function copy(node) {
    if (node.nodeType === 3) return document.createTextNode(node.textContent);
    if (node.nodeType !== 1 || blocked.has(node.tagName)) return document.createDocumentFragment();
    const target = allowed.has(node.tagName) ? document.createElement(node.tagName.toLowerCase()) : document.createDocumentFragment();
    if (target.nodeType === 1) {
      if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'FIGCAPTION'].includes(node.tagName)) target.dir = 'auto';
      if (['left', 'right', 'center', 'justify', 'start', 'end'].includes(node.style.textAlign)) target.style.textAlign = node.style.textAlign;
      if (node.tagName === 'A') {
        const href = safeAddress(node.getAttribute('href') || '');
        if (href) { target.href = href; target.rel = 'noopener noreferrer'; }
      }
      if (node.tagName === 'IMG') {
        const src = safeAddress(node.getAttribute('src') || '');
        if (!src) return document.createDocumentFragment();
        target.src = src;
        target.alt = node.getAttribute('alt') || '';
        target.loading = 'lazy';
        target.addEventListener('error', () => target.remove(), { once: true });
      }
      if (node.tagName === 'OL' && /^\d+$/.test(node.getAttribute('start') || '')) target.start = Number(node.getAttribute('start'));
    }
    node.childNodes.forEach((child) => target.appendChild(copy(child)));
    return target;
  }
  container.replaceChildren(...Array.from(source.body.childNodes, copy));
}
