import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Reset scroll position on every client-side navigation. */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
