import { useEffect } from "react";

/**
 * Optional Plausible analytics.
 * Set VITE_PLAUSIBLE_DOMAIN=your.domain.com in .env to enable.
 */
const Analytics = () => {
  useEffect(() => {
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
    if (!domain || typeof document === "undefined") return;
    if (document.querySelector('script[data-amani-plausible]')) return;

    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = domain;
    script.dataset.amaniPlausible = "1";
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  }, []);

  return null;
};

export default Analytics;
