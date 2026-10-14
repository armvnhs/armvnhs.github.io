// Keep the CMS article formatting while discarding executable markup.
function renderArticleHTML(html, container) {
  // Pages CMS/Jekyll can return rich text with HTML entities encoded once.
  // Decode that layer before parsing so headings, tables, code and lists render as elements.
  if (typeof html === 'string' && !/<[a-z][^>]*>/i.test(html) && /^\s*&lt;(?:p|div|h[1-6]|table|section|article|ul|ol|blockquote)\b/i.test(html)) {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = html;
    html = decoder.value;
  }
  const source = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['P', 'DIV', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'DEL', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE', 'A', 'IMG', 'BR', 'HR', 'FIGURE', 'FIGCAPTION', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'CAPTION', 'COLGROUP', 'COL', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'ASIDE', 'MAIN', 'DL', 'DT', 'DD', 'DETAILS', 'SUMMARY', 'SUP', 'SUB', 'MARK', 'SMALL', 'ABBR']);
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
      if (['ltr', 'rtl', 'auto'].includes(node.getAttribute('dir'))) target.dir = node.getAttribute('dir');
      const classes = (node.getAttribute('class') || '').split(/\s+/).filter((name) => ['tagline', 'lead', 'highlight'].includes(name) || (node.tagName === 'CODE' && /^language-[a-z0-9-]+$/i.test(name)));
      if (classes.length) target.className = classes.join(' ');
      if (['TD', 'TH'].includes(node.tagName)) {
        for (const attribute of ['colspan', 'rowspan']) {
          const value = node.getAttribute(attribute);
          if (/^[1-9]\d{0,2}$/.test(value || '')) target.setAttribute(attribute, value);
        }
        if (['row', 'col', 'rowgroup', 'colgroup'].includes(node.getAttribute('scope'))) target.setAttribute('scope', node.getAttribute('scope'));
      }
      if (node.tagName === 'ABBR' && node.getAttribute('title')) target.title = node.getAttribute('title');
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
