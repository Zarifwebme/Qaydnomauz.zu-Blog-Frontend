/**
 * seo.js — Dynamic SEO meta tag management
 * Updates title, description, Open Graph, Twitter cards, canonical URL
 */

import { SITE } from "./config.js";

/* ===== Helper: get or create meta tag ===== */
function ensureMeta(attr, value) {
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr.replace("property", "property").replace("name", "name"), value);
    document.head.appendChild(el);
  }
  return el;
}

function setMetaProperty(property, content) {
  const el = ensureMeta("property", property);
  el.setAttribute("property", property);
  el.setAttribute("content", content);
}

function setMetaName(name, content) {
  const el = ensureMeta("name", name);
  el.setAttribute("name", name);
  el.setAttribute("content", content);
}

function ensureLink(rel) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  return el;
}

/**
 * Set SEO meta tags for any page
 * @param {Object} opts
 * @param {string} opts.title       — Page title
 * @param {string} opts.description — Page description
 * @param {string} opts.url         — Canonical URL
 * @param {string} opts.image       — OG image URL (absolute)
 * @param {string} opts.type        — OG type: "website" | "article"
 * @param {string} [opts.publishedTime] — Article published time (ISO)
 */
export function setSEO({
  title = SITE.defaultTitle,
  description = SITE.defaultDescription,
  url = SITE.url,
  image = SITE.defaultImage,
  type = "website",
  publishedTime = "",
} = {}) {
  // Title
  document.title = title;

  // Meta description
  setMetaName("description", description);

  // Canonical URL
  const canonical = ensureLink("canonical");
  canonical.setAttribute("href", url);

  // Open Graph
  setMetaProperty("og:title", title);
  setMetaProperty("og:description", description);
  setMetaProperty("og:url", url);
  setMetaProperty("og:image", image);
  setMetaProperty("og:type", type);
  setMetaProperty("og:site_name", SITE.name);
  setMetaProperty("og:locale", SITE.locale);

  if (type === "article" && publishedTime) {
    setMetaProperty("article:published_time", publishedTime);
  }

  // Twitter Card
  setMetaName("twitter:card", "summary_large_image");
  setMetaName("twitter:title", title);
  setMetaName("twitter:description", description);
  setMetaName("twitter:image", image);
  if (SITE.twitterHandle) {
    setMetaName("twitter:site", SITE.twitterHandle);
  }
}

/**
 * Set SEO for the home page
 */
export function setHomeSEO() {
  setSEO({
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    url: SITE.url,
    image: SITE.defaultImage,
    type: "website",
  });
}

/**
 * Set SEO for a single post page
 * @param {Object} post — Post object from API
 */
export function setPostSEO(post) {
  const title = post.title
    ? `${post.title} — ${SITE.name}`
    : SITE.defaultTitle;

  const description = post.snippet || post.description
    ? (post.snippet || post.description).slice(0, 160)
    : SITE.defaultDescription;

  const image = post.image_url || SITE.defaultImage;

  // Absolute image URL
  const absImage = image.startsWith("http")
    ? image
    : `${SITE.url}/${image.replace(/^\//, "")}`;

  const slug = post.slug || post.id;
  const url = `${SITE.url}/#/posts/${encodeURIComponent(slug)}`;

  setSEO({
    title,
    description,
    url,
    image: absImage,
    type: "article",
    publishedTime: post.created_at || "",
  });
}

/**
 * Set SEO for 404 page
 */
export function set404SEO() {
  setSEO({
    title: `404 — Sahifa topilmadi | ${SITE.name}`,
    description: "Siz qidirayotgan sahifa topilmadi.",
    url: SITE.url,
    image: SITE.defaultImage,
    type: "website",
  });
}
