const load = (path) =>
  fetch(path, { cache: "no-cache" }).then((res) => {
    if (!res.ok) throw new Error(path);
    return res.json();
  });

const make = (tag, props = {}, kids = []) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...kids);
  return node;
};

const run = async (path, render) => {
  try {
    render(await load(path));
  } catch {}
};

run("data/site.json", (site) => {
  if (site.name) document.getElementById("name").textContent = site.name;
  if (site.tagline) document.getElementById("tagline").textContent = site.tagline;
  if (site.avatar) document.getElementById("avatar").src = site.avatar;
  const box = document.getElementById("social");
  (site.social || []).forEach((s) => {
    if (!s.url) return;
    box.append(make("a", { href: s.url, target: "_blank", rel: "noopener", textContent: s.label || s.url }));
  });
});

run("data/projects.json", (data) => {
  const box = document.getElementById("projects");
  (data.items || []).forEach((p) => {
    const card = make(p.link ? "a" : "div", { className: "card" });
    if (p.link) Object.assign(card, { href: p.link, target: "_blank", rel: "noopener" });
    if (p.cover) {
      const img = make("img", { src: p.cover, alt: "", loading: "lazy" });
      img.onerror = () => img.remove();
      card.append(img);
    }
    card.append(
      make("span", { className: "card-text" }, [
        make("span", { className: "card-title", textContent: p.title || "" }),
        make("span", { className: "card-cat", textContent: p.category || "" })
      ])
    );
    box.append(card);
  });
});

run("data/brands.json", (data) => {
  const items = data.items || [];
  if (!items.length) return;
  const box = document.getElementById("brands");
  items.forEach((b) => {
    if (!b.logo) {
      box.append(make("span", { textContent: b.name || "" }));
      return;
    }
    const img = make("img", { src: b.logo, alt: b.name || "", loading: "lazy" });
    img.onerror = () => img.replaceWith(make("span", { textContent: b.name || "" }));
    box.append(img);
  });
  document.getElementById("brands-section").hidden = false;
});
