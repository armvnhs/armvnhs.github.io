function showArticle(note) {
      document.title = note.title + ' — Notes';
      document.querySelector('meta[name="description"]').content = note.subtitle || note.title;
      document.getElementById('title').textContent = note.title;
      const summary = document.getElementById('summary');
      summary.textContent = note.subtitle || '';
      summary.hidden = !note.subtitle;
      const cover = document.getElementById('cover');
      if (typeof note.image === 'string' && note.image.trim()) {
        try {
          const url = new URL(note.image, location.href);
          if (['http:', 'https:'].includes(url.protocol)) {
            cover.addEventListener('error', () => { cover.hidden = true; }, { once: true });
            cover.src = note.image;
            cover.alt = note.title;
            cover.hidden = false;
          }
        } catch { /* Keep the article readable without its cover. */ }
      }
      const body = document.getElementById('body');
      body.replaceChildren();
      const text = typeof note.body === 'string' ? note.body.trim() : '';
      if (note.bodyFormat === 'html' && text) {
        renderArticleHTML(text, body);
      } else {
      const paragraphs = text ? text.split(/\r?\n\s*\r?\n/) : ['This article has no text yet.'];
      paragraphs.forEach((text) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        paragraph.dir = 'auto';
        body.appendChild(paragraph);
      });
      }
      document.getElementById('status').hidden = true;
      document.getElementById('article').hidden = false;
    }

