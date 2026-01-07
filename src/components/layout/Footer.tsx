import { Link } from "react-router-dom";
import { Leaf, Instagram, Linkedin, Twitter, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    discover: [
      { label: "Destinations", href: "/destinations" },
      { label: "Espaces Coworking", href: "/coworkings" },
      { label: "Hébergements", href: "/accommodations" },
      { label: "Activités", href: "/activities" },
      { label: "Mobilité Douce", href: "/mobility" },
    ],
    community: [
      { label: "Blog & Récits", href: "/blog" },
      { label: "Avis voyageurs", href: "/reviews" },
      { label: "Événements", href: "/events" },
      { label: "Ambassadeurs", href: "/ambassadors" },
    ],
    impact: [
      { label: "Notre Mission", href: "/mission" },
      { label: "Calculateur Carbone", href: "/carbon-calculator" },
      { label: "Associations Partenaires", href: "/partners" },
      { label: "Rapport d'Impact", href: "/impact-report" },
    ],
    support: [
      { label: "Centre d'aide", href: "/help" },
      { label: "Devenir Partenaire", href: "/become-partner" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  };

  return (
    <footer className="bg-foreground text-background/90">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background">
                Cowork<span className="text-primary-glow">ation</span>
              </span>
            </Link>
            <p className="text-background/70 text-sm mb-6 max-w-xs">
              La plateforme tout-en-un pour planifier vos séjours de travail à distance, 
              tout en réduisant votre empreinte carbone.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 mb-6">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-background/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@coworkation.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-semibold text-background mb-4">Découvrir</h4>
            <ul className="space-y-2.5">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-primary-glow transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-background mb-4">Communauté</h4>
            <ul className="space-y-2.5">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-primary-glow transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Impact */}
          <div>
            <h4 className="font-semibold text-background mb-4">Impact</h4>
            <ul className="space-y-2.5">
              {footerLinks.impact.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-primary-glow transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-background mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-primary-glow transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/50">
            <p>© {currentYear} Coworkation. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-background transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="hover:text-background transition-colors">
                CGU
              </Link>
              <Link to="/cookies" className="hover:text-background transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
