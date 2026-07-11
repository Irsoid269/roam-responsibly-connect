import { useEffect } from "react";

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
}

const DEFAULT_TITLE = "Amani Resorts — Éco-luxe boutique aux Comores";
const DEFAULT_DESC =
  "Séjours éco-luxe, coworking et mobilité douce aux Comores. Amani Resorts.";

/** Met à jour title / meta description / canonical pour le SEO de base. */
const Seo = ({ title, description, path = "/" }: SeoProps) => {
  useEffect(() => {
    const fullTitle = title ? `${title} · Amani Resorts` : DEFAULT_TITLE;
    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description || DEFAULT_DESC);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description || DEFAULT_DESC, true);
    setMeta("og:type", "website", true);
    setMeta("twitter:card", "summary_large_image");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    const origin = window.location.origin;
    canonical.href = `${origin}${path}`;
  }, [title, description, path]);

  return null;
};

export default Seo;
