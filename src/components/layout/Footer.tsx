import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Instagram, Linkedin, Twitter, Mail, MapPin } from "lucide-react";
import amaniSymbol from "@/assets/amani-symbol-gold.jpg";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    discover: [
      { label: t("footer.discover.destinations"), href: "/destinations" },
      { label: t("footer.discover.coworkings"), href: "/coworkings" },
      { label: t("footer.discover.accommodations"), href: "/accommodations" },
      { label: t("footer.discover.activities"), href: "/activities" },
      { label: t("footer.discover.mobility"), href: "/mobility" },
    ],
    community: [
      { label: t("footer.community.blog"), href: "/blog" },
      { label: t("footer.community.reviews"), href: "/reviews" },
      { label: t("footer.community.events"), href: "/events" },
      { label: t("footer.community.ambassadors"), href: "/ambassadors" },
    ],
    impact: [
      { label: t("footer.impact.mission"), href: "/mission" },
      { label: t("footer.impact.carbonCalculator"), href: "/carbon-calculator" },
      { label: t("footer.impact.partners"), href: "/partners" },
      { label: t("footer.impact.report"), href: "/impact-report" },
    ],
    support: [
      { label: t("footer.support.help"), href: "/help" },
      { label: t("footer.support.becomePartner"), href: "/become-partner" },
      { label: t("footer.support.contact"), href: "/contact" },
      { label: t("footer.support.faq"), href: "/faq" },
    ],
  };

  return (
    <footer className="bg-foreground text-background/90">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={amaniSymbol} alt="Amani Resorts" className="w-11 h-11 rounded-full object-cover" />
              <span className="font-display text-2xl font-medium text-background leading-none">
                AMANI<span className="text-accent"> Resorts</span>
              </span>
            </Link>
            <p className="text-background/70 text-sm mb-6 max-w-xs leading-relaxed">
              {t("footer.tagline")}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 mb-6">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:-translate-y-0.5"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:-translate-y-0.5"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:-translate-y-0.5"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-background/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@amaniresorts.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Moroni, Comores</span>
              </div>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-semibold text-background mb-4">{t("footer.columns.discover")}</h4>
            <ul className="space-y-2.5">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-accent transition-colors link-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-background mb-4">{t("footer.columns.community")}</h4>
            <ul className="space-y-2.5">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-accent transition-colors link-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Impact */}
          <div>
            <h4 className="font-semibold text-background mb-4">{t("footer.columns.impact")}</h4>
            <ul className="space-y-2.5">
              {footerLinks.impact.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-accent transition-colors link-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-background mb-4">{t("footer.columns.support")}</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-accent transition-colors link-underline"
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
            <p>{t("footer.rights", { year: currentYear })}</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-background transition-colors">
                {t("footer.legal.privacy")}
              </Link>
              <Link to="/terms" className="hover:text-background transition-colors">
                {t("footer.legal.terms")}
              </Link>
              <Link to="/cookies" className="hover:text-background transition-colors">
                {t("footer.legal.cookies")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
