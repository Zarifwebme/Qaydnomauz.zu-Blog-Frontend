import { initHome } from "./index.js";
import { initPost } from "./post.js";
import { setNavAuthState } from "./ui.js";
import { setHomeSEO, set404SEO } from "./seo.js";

/* ===== Hash Router ===== */
const VIEWS = ["homeView", "postView", "notFoundView"];

function showView(id) {
  for (const v of VIEWS) {
    const el = document.getElementById(v);
    if (el) el.style.display = v === id ? "" : "none";
  }
}

function parseHash() {
  const hash = window.location.hash || "#/";
  const m = hash.match(/^#\/posts\/([^/]+)\/?$/);
  if (m) return { route: "post", slug: decodeURIComponent(m[1]) };
  if (hash === "#/" || hash === "#" || hash === "") return { route: "home" };
  return { route: "404" };
}

let homeReady = false;

async function handleRoute() {
  const { route, slug } = parseHash();

  if (route === "post") {
    showView("postView");
    // SEO will be set inside initPost after loading post data
    await initPost(slug);
  } else if (route === "home") {
    showView("homeView");
    if (!homeReady) {
      await initHome();
      homeReady = true;
    }
    setHomeSEO();
  } else {
    showView("notFoundView");
    set404SEO();
  }

  window.scrollTo({ top: 0, behavior: "instant" });
}

setNavAuthState();
window.addEventListener("hashchange", handleRoute);
handleRoute();
