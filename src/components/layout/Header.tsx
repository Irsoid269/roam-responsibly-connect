import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Globe, Shield } from "lucide-react";
import amaniSymbol from "@/assets/amani-symbol-gold.jpg";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const { isAdmin } = useAdminAuth();

  const navLinks = [
    { label: "Destinations", href: "/destinations" },
    { label: "Coworkings", href: "/coworkings" },
    { label: "Communauté", href: "/community" },
    { label: "Notre Impact", href: "/impact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-strong border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={amaniSymbol}
                alt="Amani Resorts"
                className="w-10 h-10 rounded-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="font-display text-2xl font-medium text-foreground leading-none">
                AMANI<span className="text-accent"> Resorts</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <Globe className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              {!loading && (user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Shield className="w-4 h-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Se connecter</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="default" size="sm">Créer un compte</Button>
                  </Link>
                </>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-strong border-b border-border/50"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-base font-medium text-foreground py-3 px-4 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                {!loading && (user ? (
                  <div className="flex flex-col gap-2">
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full gap-2">
                          <Shield className="w-4 h-4" />
                          Administration
                        </Button>
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="default" className="w-full">Mon profil</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link to="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Se connecter</Button>
                    </Link>
                    <Link to="/signup" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="default" className="w-full">Créer un compte</Button>
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
