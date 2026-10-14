# Portfolio

## CMS content
- Site settings: data/site.json — profile, social links, headings and availability.
- Projects: data/projects.json — title, category, image and link.
- Products: data/products.json — title, subtitle, image and link.
- Blog posts: _notes/*.md — one article per file.

In Pages CMS, open Blog posts and create or edit a post. The article field is a rich-text editor supporting headings, emphasis, lists, links and inline images. Use a unique slug and keep it unchanged to preserve the article URL.

Availability in Site settings:
- available: green, available for work
- busy: orange, currently busy
- not-set: gray, no status selected

Images are uploaded to assets/img/projects, products, notes or site according to their CMS editor.
The favicon is assets/img/site/Icon.png.
Fonts are loaded locally from assets/font using assets/site.css.

## GitHub Pages deployment
Upload index.html, note.html, .pages.yml, _config.yml, notes-feed.json, assets/site.css, assets/blog.js, assets/article.js and the _notes and _layouts folders. Include the fonts and assets/img/site/Icon.png.
In the existing data/site.json, add availability without replacing other content.

This version uses the standard Jekyll build provided by GitHub Pages. Publish from the branch and repository root. If an existing workflow only copies static files, it must build Jekyll first. Do not disable Jekyll with .nojekyll.

Jekyll reads the articles in _notes and generates /data/blog.json from notes-feed.json. The site then displays those articles and opens /note/the-post-slug/.
Jekyll also generates note/the-post-slug/index.html for each article using _layouts/note.html. The old note.html?slug= URL redirects to the new article page.
No generated blog.json file or article index.html needs to be maintained manually.

## Existing articles
The local sample from data/notes.json was migrated to _notes/first-note.md.
If you added articles directly on GitHub, create a matching post for each in Blog posts and copy over the title, slug, description, image and article body.
The old data/notes.json is retained only for a basic local preview; it is no longer the production blog source.

## Local preview and validation
A Jekyll build is required to preview changes to the article collection. With Jekyll installed, run jekyll serve and open the address it prints.
A plain HTTP server can preview the layout using the old local notes.json sample, but cannot generate the current article feed.
Opening index.html through file:// cannot reliably load the content.

JavaScript syntax, local assets, article link behavior and rich-content filtering were checked. The Jekyll build and final browser rendering still require verification in an environment where Jekyll and Chrome are available.
