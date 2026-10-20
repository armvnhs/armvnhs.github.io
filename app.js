const ICONS = {"brand-instagram": "<path d=\"M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4l0 -10\" /> <path d=\"M8.5 12a3.5 3.5 0 1 0 7 0a3.5 3.5 0 0 0 -7 0\" /> <path d=\"M17 7v.01\" />", "brand-telegram": "<path d=\"M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4\" />", "arrow-up-right": "<path d=\"M17 7l-10 10\" /> <path d=\"M8 7l9 0l0 9\" />", "file-text": "<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" /> <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2\" /> <path d=\"M9 9l1 0\" /> <path d=\"M9 13l6 0\" /> <path d=\"M9 17l6 0\" />", "brand-behance": "<path d=\"M3 18v-12h4.5a3 3 0 0 1 0 6a3 3 0 0 1 0 6h-4.5\" /> <path d=\"M3 12l4.5 0\" /> <path d=\"M14 13h7a3.5 3.5 0 0 0 -7 0v2a3.5 3.5 0 0 0 6.64 1\" /> <path d=\"M16 6l3 0\" />", "brand-linkedin": "<path d=\"M8 11v5\" /> <path d=\"M8 8v.01\" /> <path d=\"M12 16v-5\" /> <path d=\"M16 16v-3a2 2 0 1 0 -4 0\" /> <path d=\"M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4l0 -10\" />", "link": "<path d=\"M9 15l6 -6\" /> <path d=\"M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464\" /> <path d=\"M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463\" />", "brand-x": "<path d=\"M4 4l11.733 16h4.267l-11.733 -16l-4.267 0\" /> <path d=\"M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772\" />", "brand-pinterest": "<path d=\"M8 20l4 -9\" /> <path d=\"M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.554 3.75 -4a5 5 0 1 0 -9.7 1.7\" /> <path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />", "mail": "<path d=\"M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10\" /> <path d=\"M3 7l9 6l9 -6\" />", "brand-github": "<path d=\"M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5\" />", "brand-dribbble": "<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" /> <path d=\"M9 3.6c5 6 7 10.5 7.5 16.2\" /> <path d=\"M6.4 19c3.5 -3.5 6 -6.5 14.5 -6.4\" /> <path d=\"M3.1 10.75c5 0 9.814 -.38 15.314 -5\" />", "briefcase": "<path d=\"M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9\" /> <path d=\"M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2\" /> <path d=\"M12 12l0 .01\" /> <path d=\"M3 13a20 20 0 0 0 18 0\" />"};
const data = {};
const files = {
  site: "/data/site.json",
  projects: "/data/projects.json",
  companies: "/data/companies.json",
  resume: "/data/resume.json"
};
const STATUS = { available: "Available for new projects", busy: "Busy right now" };
const HOSTS = [
  ["instagram", "brand-instagram"],
  ["behance", "brand-behance"],
  ["dribbble", "brand-dribbble"],
  ["linkedin", "brand-linkedin"],
  ["t.me", "brand-telegram"],
  ["telegram", "brand-telegram"],
  ["twitter", "brand-x"],
  ["x.com", "brand-x"],
  ["github", "brand-github"],
  ["pinterest", "brand-pinterest"]
];

const abs = (p) => (p && !/^(https?:|data:|\/)/.test(p) ? "/" + p : p || "");

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

const svg = (name) =>
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  (ICONS[name] || ICONS.link) +
  "</svg>";

const arrowIcon = () => make("span", { className: "arrow", innerHTML: svg("arrow-up-right") });

const iconFor = (url) => {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {}
  const hit = HOSTS.find(([key]) => host.includes(key));
  return hit ? hit[1] : "link";
};

const card = ({ href, title, category, cover }) => {
  const node = make(href ? "a" : "div", { className: "card" });
  if (href) Object.assign(node, { href, target: "_blank", rel: "noopener" });
  if (cover) {
    const img = make("img", { src: abs(cover), alt: "", loading: "lazy" });
    img.onerror = () => img.remove();
    node.append(img);
  }
  node.append(
    make("span", { className: "card-bottom" }, [
      make("span", { className: "card-text" }, [
        make("span", { className: "card-title", textContent: title || "" }),
        make("span", { className: "card-cat", textContent: category || "" })
      ]),
      arrowIcon()
    ])
  );
  return node;
};

const logoTile = (c) => {
  const node = make("a", { className: "logo-tile", href: "/company/" + encodeURIComponent(c.slug || ""), title: c.name || "" });
  node.setAttribute("aria-label", c.name || "");
  const fallback = () => make("span", { textContent: c.name || "" });
  if (c.logo) {
    const img = make("img", { src: abs(c.logo), alt: c.name || "", loading: "lazy" });
    img.onerror = () => img.replaceWith(fallback());
    node.append(img);
  } else {
    node.append(fallback());
  }
  return node;
};

const section = (title, className, items) =>
  make("section", { className: "block" }, [
    make("h2", { className: "section-title", textContent: title }),
    make("div", { className }, items)
  ]);

const logosSection = (title, items) => {
  const node = section(title, "logos", items);
  node.lastElementChild.style.setProperty("--n", Math.min(items.length, 6));
  return node;
};

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
    const avatar = make("img", { className: "avatar", src: abs(s.avatar), alt: s.name || "", width: 92, height: 92 });
    avatar.onerror = () => (avatar.style.opacity = 0);
    const wrap = make("div", { className: "avatar-wrap" }, [avatar]);
    if (STATUS[s.status]) {
      const dot = make("span", { className: "status is-" + s.status, tabIndex: 0 }, [
        make("span", { className: "tip", textContent: STATUS[s.status] })
      ]);
      dot.setAttribute("aria-label", STATUS[s.status]);
      wrap.append(dot);
    }
    const socials = (s.social || [])
      .filter((x) => x.url)
      .map((l) => {
        const a = make("a", { className: "social-link", href: l.url, target: "_blank", rel: "noopener", innerHTML: svg(iconFor(l.url)) });
        a.setAttribute("aria-label", l.label || l.url);
        return a;
      });
    const nodes = [
      make("header", { className: "hero" }, [
        wrap,
        make("h1", { textContent: s.name || "" }),
        make("p", { className: "tagline", textContent: s.tagline || "" }),
        make("div", { className: "socials" }, socials)
      ]),
      make("hr", { className: "rule" })
    ];
    if (projects.length) {
      nodes.push(section("Projects", "grid", projects.map((p) => card({ href: p.link, title: p.title, category: p.category, cover: p.cover }))));
    }
    if (companies.length) nodes.push(logosSection("Companies", companies.map(logoTile)));
    return { title: "", nodes };
  },

  company(slug) {
    const c = (data.companies.items || []).find((x) => x.slug === slug);
    const back = make("a", { className: "back", href: "/", textContent: "← Work" });
    if (!c) {
      return { title: "Not found", nodes: [back, make("p", { className: "lead", textContent: "This page does not exist." })] };
    }
    const nodes = [back];
    if (c.cover) {
      const img = make("img", { className: "post-cover", src: abs(c.cover), alt: c.name || "" });
      img.onerror = () => img.remove();
      nodes.push(img);
    }
    const head = [];
    if (c.logo) {
      const logo = make("img", { className: "post-logo", src: abs(c.logo), alt: "" });
      logo.onerror = () => logo.remove();
      head.push(logo);
    }
    nodes.push(
      make("article", { className: "post-body" }, [
        ...head,
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
        make("a", { className: "btn", href: abs(r.pdf), target: "_blank", rel: "noopener" }, [
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

let path = location.pathname;

const render = () => {
  const [page = "", arg = ""] = path.split("/").filter(Boolean);
  const view =
    page === "company"
      ? views.company(decodeURIComponent(arg))
      : Object.hasOwn(views, page)
        ? views[page]()
        : views.work();
  document.getElementById("app").replaceChildren(...view.nodes);
  document.title = (view.title ? view.title + " — " : "") + (data.site.name || "Arman Haghshenas");
  const key = page === "resume" || page === "contact" ? page : "work";
  document.querySelectorAll("[data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === key));
  window.scrollTo(0, 0);
};

const go = (to) => {
  path = to;
  try {
    history.pushState(null, "", to);
  } catch {}
  render();
};

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href^='/']");
  if (!a || a.target === "_blank" || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  go(a.getAttribute("href"));
});

Promise.all(
  Object.entries(files).map(async ([key, path]) => {
    try {
      data[key] = await load(path);
    } catch {
      data[key] = {};
    }
  })
).then(() => {
  render();
  addEventListener("popstate", () => {
    path = location.pathname;
    render();
  });
});
