import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth, AppRole } from "@/hooks/useAdminAuth";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  MapPin,
  Building2,
  Home,
  Bike,
  Compass,
  MessageSquare,
  PenLine,
  Megaphone,
  Inbox,
  Newspaper,
  CalendarDays,
  Award,
  LogOut,
  Menu,
  X,
  Target,
  Leaf,
  Heart,
  TrendingUp,
  ExternalLink,
  Gauge,
  HandHeart,
  QrCode,
  History,
  Flag,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pageTransition } from "@/lib/motion";
import amaniSymbol from "@/assets/amani-symbol-gold.jpg";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  // Rôles (en plus de admin, toujours autorisé) pouvant accéder à cette page.
  // Omis = admin uniquement.
  allowedRoles?: AppRole[];
}

// roles omis = visible uniquement par admin (section sensible ou pas encore
// ouverte à un rôle métier).
const navGroups: {
  label: string;
  items: { label: string; href: string; icon: typeof LayoutDashboard; end?: boolean; roles?: AppRole[] }[];
}[] = [
  {
    label: "Vue d'ensemble",
    items: [
      {
        label: "Tableau de bord",
        href: "/admin",
        icon: LayoutDashboard,
        end: true,
        roles: ["organizer", "partner_manager", "support", "finance"],
      },
      { label: "Réservations", href: "/admin/reservations", icon: CalendarCheck, roles: ["support", "finance"] },
      { label: "Utilisateurs", href: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Pages communauté",
    items: [
      { label: "Communauté", href: "/admin/community", icon: PenLine },
      { label: "Blog & Récits", href: "/admin/blog", icon: Newspaper, roles: ["organizer"] },
      { label: "Avis voyageurs", href: "/admin/reviews", icon: MessageSquare },
      { label: "Événements", href: "/admin/events", icon: CalendarDays, roles: ["organizer"] },
      { label: "Ambassadeurs", href: "/admin/ambassadors", icon: Award, roles: ["organizer"] },
    ],
  },
  {
    label: "Modération",
    items: [
      { label: "Boîte de réception", href: "/admin/inbox", icon: Inbox, roles: ["support", "partner_manager"] },
      { label: "Signalements", href: "/admin/moderation", icon: Flag, roles: ["support"] },
      { label: "Notifications", href: "/admin/notifications", icon: BellRing, roles: ["support"] },
      { label: "Journal d'audit", href: "/admin/audit-log", icon: History },
    ],
  },
  {
    label: "Impact & mission",
    items: [
      { label: "Notre Mission", href: "/admin/impact-content?tab=mission", icon: Target },
      { label: "Calculateur Carbone", href: "/admin/impact-content?tab=carbon", icon: Leaf },
      { label: "Facteurs carbone", href: "/admin/carbon-factors", icon: Gauge },
      { label: "Compensation (dons)", href: "/admin/ngos", icon: HandHeart, roles: ["finance"] },
      { label: "Actions durables", href: "/admin/sustainable-actions", icon: QrCode, roles: ["organizer"] },
      { label: "Associations Partenaires", href: "/admin/impact-content?tab=partners", icon: Heart, roles: ["partner_manager"] },
      { label: "Rapport d'Impact", href: "/admin/impact-content?tab=report", icon: TrendingUp },
    ],
  },
  {
    label: "Page d'accueil",
    items: [
      { label: "CTA Accueil", href: "/admin/homepage-cta", icon: Megaphone },
      { label: "Destinations", href: "/admin/destinations", icon: MapPin, roles: ["partner_manager"] },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Coworkings", href: "/admin/coworkings", icon: Building2, roles: ["partner_manager"] },
      { label: "Hébergements", href: "/admin/accommodations", icon: Home, roles: ["partner_manager"] },
      { label: "Mobilité", href: "/admin/mobility", icon: Bike, roles: ["partner_manager"] },
      { label: "Activités", href: "/admin/activities", icon: Compass, roles: ["partner_manager"] },
    ],
  },
];

const AdminLayout = ({ children, title, description, actions, allowedRoles }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, hasAnyRole, roles, loading } = useAdminAuth();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const authorized = hasAnyRole(allowedRoles ?? ["admin"]);

  useEffect(() => {
    if (!loading && !authorized) {
      navigate("/");
    }
  }, [authorized, loading, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement admin…</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const canSee = (itemRoles?: AppRole[]) =>
    isAdmin || (!!itemRoles && itemRoles.some((r) => roles.includes(r)));

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border/80">
        <Link to="/admin" className="flex items-center gap-3 group">
          <img
            src={amaniSymbol}
            alt="Amani"
            className="w-9 h-9 rounded-full object-cover transition-transform group-hover:scale-105"
          />
          <div>
            <span className="font-display text-xl font-medium leading-none block">
              AMANI<span className="text-accent"> Admin</span>
            </span>
            <p className="text-xs text-muted-foreground mt-1">Espace administration</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {navGroups
          .map((group) => ({ ...group, items: group.items.filter((item) => canSee(item.roles)) }))
          .filter((group) => group.items.length > 0)
          .map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-luxury text-muted-foreground/80">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={() => {
                    const [path, query] = item.href.split("?");
                    const active = query
                      ? location.pathname === path &&
                        (location.search === `?${query}` ||
                          (query === "tab=mission" && !location.search))
                      : item.end
                        ? location.pathname === path
                        : location.pathname === path ||
                          location.pathname.startsWith(`${path}/`);
                    return cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    );
                  }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border/80 space-y-1">
        {user?.email && (
          <p className="px-3 py-1 text-xs text-muted-foreground truncate" title={user.email}>
            {user.email}
          </p>
        )}
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Voir le site
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={amaniSymbol} alt="" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-display text-lg font-medium">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-background border-r border-border/80">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r shadow-xl lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="sticky top-14 lg:top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-xl">
          <div className="px-5 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-medium text-foreground tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </div>

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
          className="p-5 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLayout;
