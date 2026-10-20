const data = {};
const files = {
  site: "data/site.json",
  projects: "data/projects.json",
  companies: "data/companies.json",
  resume: "data/resume.json"
};

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

const arrowIcon = () =>
  make("span", {
    className: "arrow",
    innerHTML:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  });

const card = ({ href, external, label, title, cover }) => {
  const node = make(href ? "a" : "div", { className: "card" });
  if (href) {
    node.href = href;
    if (external) Object.assign(node, { target: "_blank", rel: "noopener" });
  }
  if (cover) {
    const img = make("img", { src: cover, alt: "", loading: "lazy" });
    img.onerror = () => img.remove();
    node.append(img);
  }
  node.append(
    make("span", { className: "card-top" }, [
      make("span", { className: "card-label", textContent: label || "" }),
      make("span", { className: "card-dots" }, [make("i"), make("i"), make("i")])
    ]),
    make("span", { className: "card-bottom" }, [
      make("span", { className: "card-title", textContent: title || "" }),
      arrowIcon()
    ])
  );
  return node;
};

const section = (title, items) =>
  make("section", { className: "block" }, [
    make("h2", { className: "section-title", textContent: title }),
    make("div", { className: "grid" }, items)
  ]);

const entry = (name, role, period, details) =>
  make("li", {}, [
    make("div", { className: "tl-head" }, [
      make("p", { className: "tl-name", textContent: name || "" }),
      make("span", { className: "tl-period", textContent: period || "" })
    ]),
    make("p", { className: "tl-role", textContent: role || "" }),
    ...(details ? [make("p", { className: "tl-details", textContent: details })] : [])
  ]);

const timeline = (title, items, row) =>
  items && items.length
    ? [make("h2", { className: "block-title", textContent: title }), make("ul", { className: "tl" }, items.map(row))]
    : [];

const views = {
  work() {
    const s = data.site;
    const projects = data.projects.items || [];
    const companies = data.companies.items || [];
    const avatar = make("img", { className: "avatar", src: s.avatar || "", alt: s.name || "", width: 140, height: 140 });
    avatar.onerror = () => (avatar.style.opacity = 0);
    const nodes = [
      make("header", { className: "hero" }, [
        avatar,
        make("h1", { textContent: s.name || "" }),
        make("p", { className: "tagline", textContent: s.tagline || "" })
      ]),
      make("hr", { className: "rule" })
    ];
    if (projects.length) {
      nodes.push(
        section(
          "Projects",
          projects.map((p) => card({ href: p.link, external: true, label: p.category, title: p.title, cover: p.cover }))
        )
      );
    }
    if (companies.length) {
      nodes.push(
        section(
          "Companies",
          companies.map((c) =>
            card({ href: "#/company/" + encodeURIComponent(c.slug || ""), label: c.period || "Company", title: c.name, cover: c.cover })
          )
        )
      );
    }
    return { title: "", nodes };
  },

  company(slug) {
    const c = (data.companies.items || []).find((x) => x.slug === slug);
    const back = make("a", { className: "back", href: "#/", textContent: "← Work" });
    if (!c) {
      return { title: "Not found", nodes: [back, make("p", { className: "lead", textContent: "This page does not exist." })] };
    }
    const nodes = [back];
    if (c.cover) {
      const img = make("img", { className: "post-cover", src: c.cover, alt: c.name || "" });
      img.onerror = () => img.remove();
      nodes.push(img);
    }
    nodes.push(
      make("article", { className: "post-body" }, [
        make("p", { className: "post-meta", textContent: [c.role, c.period].filter(Boolean).join(" · ") }),
        make("h1", { className: "post-title", textContent: c.name || "" }),
        make("p", { className: "post-lead", textContent: c.summary || "" }),
        make("div", { className: "prose", innerHTML: c.body || "" })
      ])
    );
    return { title: c.name, nodes };
  },

  resume() {
    const r = data.resume;
    const nodes = [make("h1", { className: "page-title", textContent: "Resume" })];
    if (r.summary) nodes.push(make("p", { className: "lead", textContent: r.summary }));
    if (r.pdf) {
      nodes.push(
        make("a", { className: "btn", href: r.pdf, target: "_blank", rel: "noopener" }, [
          document.createTextNode("Download PDF"),
          arrowIcon()
        ])
      );
    }
    nodes.push(...timeline("Experience", r.experience, (e) => entry(e.company, e.role, e.period, e.details)));
    nodes.push(...timeline("Education", r.education, (e) => entry(e.school, e.degree, e.period, "")));
    if ((r.skills || []).length) {
      nodes.push(
        make("h2", { className: "block-title", textContent: "Skills" }),
        make("div", { className: "chips" }, r.skills.map((t) => make("span", { textContent: t })))
      );
    }
    return { title: "Resume", nodes };
  },

  contact() {
    const s = data.site;
    const nodes = [
      make("h1", { className: "page-title", textContent: "Contact" }),
      make("p", { className: "lead", textContent: s.contactText || "" })
    ];
    if (s.email) nodes.push(make("a", { className: "mail", href: "mailto:" + s.email, textContent: s.email }));
    const links = (s.social || []).filter((x) => x.url);
    if (links.length) {
      nodes.push(
        make(
          "div",
          { className: "links" },
          links.map((l) =>
            make("a", { className: "link-row", href: l.url, target: "_blank", rel: "noopener" }, [
              make("span", { textContent: l.label || l.url }),
              arrowIcon()
            ])
          )
        )
      );
    }
    return { title: "Contact", nodes };
  }
};

const render = () => {
  const [, page = "", arg = ""] = location.hash.slice(1).split("/");
  const view =
    page === "company"
      ? views.company(decodeURIComponent(arg))
      : Object.hasOwn(views, page) && page !== "company"
        ? views[page]()
        : views.work();
  document.getElementById("app").replaceChildren(...view.nodes);
  document.title = (view.title ? view.title + " — " : "") + (data.site.name || "Arman Haghshenas");
  const key = page === "resume" || page === "contact" ? page : "work";
  document.querySelectorAll("[data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === key));
  document.getElementById("social").hidden = page === "contact";
  window.scrollTo(0, 0);
};

Promise.all(
  Object.entries(files).map(async ([key, path]) => {
    try {
      data[key] = await load(path);
    } catch {
      data[key] = {};
    }
  })
).then(() => {
  const box = document.getElementById("social");
  (data.site.social || []).forEach((s) => {
    if (s.url) box.append(make("a", { href: s.url, target: "_blank", rel: "noopener", textContent: s.label || s.url }));
  });
  render();
  addEventListener("hashchange", render);
});
