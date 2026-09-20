import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Menu, X, Shield } from "lucide-react";
import amaniSymbol from "@/assets/amani-symbol-gold.jpg";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";
import GlobalSearch from "@/components/layout/GlobalSearch";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const { isAdmin } = useAdminAuth();
  const location = useLocation();

  const navLinks = [
    { label: t("nav.destinations"), href: "/destinations" },
    { label: t("nav.coworkings"), href: "/coworkings" },
    { label: t("nav.community"), href: "/community" },
    { label: t("nav.impact"), href: "/impact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={cn(
          "border-b transition-[background,box-shadow,backdrop-filter] duration-300",
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-border/60 shadow-sm"
            : "glass-strong border-border/40"
        )}
      >
        <div className="container mx-auto px-4">
          <div
            className={cn(
              "flex items-center justify-between transition-[height] duration-300",
              scrolled ? "h-14 md:h-16" : "h-16 md:h-20"
            )}
          >
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={amaniSymbol}
                alt="Amani Resorts"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display text-xl md:text-2xl font-medium text-foreground leading-none">
                AMANI<span className="text-accent"> Resorts</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      "relative px-3 py-2 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={cn(
                          "absolute bottom-1 left-3 right-3 h-0.5 bg-accent origin-left transition-transform duration-300",
                          isActive ? "scale-x-100" : "scale-x-0"
                        )}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <GlobalSearch />
              <LanguageSwitcher />
              {!loading &&
                (user ? (
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Link to="/admin">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Shield className="w-4 h-4" />
                          {t("auth.admin")}
                        </Button>
                      </Link>
                    )}
                    <Link to="/profile">
                      <Avatar className="w-9 h-9 cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-accent/60">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm">
                        {t("auth.login")}
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="default" size="sm">
                        {t("auth.signup")}
                      </Button>
                    </Link>
                  </>
                ))}
            </div>

            <div className="flex items-center gap-1 lg:hidden">
              <GlobalSearch />
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? t("auth.closeMenu") : t("auth.openMenu")}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    className={({ isActive }) =>
                      cn(
                        "text-base font-medium py-3 px-4 rounded-lg transition-colors duration-200",
                        isActive
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground hover:bg-muted"
                      )
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="h-px bg-border my-2" />
                {!loading &&
                  (user ? (
                    <div className="flex flex-col gap-2">
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" className="w-full gap-2">
                            <Shield className="w-4 h-4" />
                            {t("auth.administration")}
                          </Button>
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="default" className="w-full">
                          {t("auth.myProfile")}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <Link to="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          {t("auth.login")}
                        </Button>
                      </Link>
                      <Link to="/signup" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="default" className="w-full">
                          {t("auth.signup")}
                        </Button>
                      </Link>
                    </div>
                  ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
