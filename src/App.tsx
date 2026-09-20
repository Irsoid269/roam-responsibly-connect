import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import Seo from "@/components/Seo";
import ScrollToTop from "@/components/layout/ScrollToTop";
import PublicLayout from "@/components/layout/PublicLayout";
import Analytics from "@/components/Analytics";

const Index = lazy(() => import("./pages/Index"));
const CarbonCalculatorPage = lazy(() => import("./pages/CarbonCalculatorPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DestinationsPage = lazy(() => import("./pages/DestinationsPage"));
const DestinationDetailPage = lazy(() => import("./pages/DestinationDetailPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const CoworkingsPage = lazy(() => import("./pages/CoworkingsPage"));
const ImpactPage = lazy(() => import("./pages/ImpactPage"));
const AccommodationsPage = lazy(() => import("./pages/AccommodationsPage"));
const ActivitiesPage = lazy(() => import("./pages/ActivitiesPage"));
const MobilityPage = lazy(() => import("./pages/MobilityPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const AmbassadorsPage = lazy(() => import("./pages/AmbassadorsPage"));
const MissionPage = lazy(() => import("./pages/MissionPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const ImpactReportPage = lazy(() => import("./pages/ImpactReportPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const BecomePartnerPage = lazy(() => import("./pages/BecomePartnerPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminReservations = lazy(() => import("./pages/admin/AdminReservations"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminDestinations = lazy(() => import("./pages/admin/AdminDestinations"));
const AdminCoworkings = lazy(() => import("./pages/admin/AdminCoworkings"));
const AdminAccommodations = lazy(() => import("./pages/admin/AdminAccommodations"));
const AdminMobility = lazy(() => import("./pages/admin/AdminMobility"));
const AdminActivities = lazy(() => import("./pages/admin/AdminActivities"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminCommunity = lazy(() => import("./pages/admin/AdminCommunity"));
const AdminHomepageCta = lazy(() => import("./pages/admin/AdminHomepageCta"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminInbox = lazy(() => import("./pages/admin/AdminInbox"));
const AdminAmbassadors = lazy(() => import("./pages/admin/AdminAmbassadors"));
const AdminImpactContent = lazy(() => import("./pages/admin/AdminImpactContent"));
const AdminCarbonFactors = lazy(() => import("./pages/admin/AdminCarbonFactors"));
const AdminNgos = lazy(() => import("./pages/admin/AdminNgos"));
const AdminSustainableActions = lazy(() => import("./pages/admin/AdminSustainableActions"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminModeration = lazy(() => import("./pages/admin/AdminModeration"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground font-medium tracking-wide">Amani</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <Analytics />
        <BrowserRouter>
          <Seo />
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/carbon-calculator" element={<CarbonCalculatorPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/destinations/:id" element={<DestinationDetailPage />} />
                <Route path="/booking/:id" element={<BookingPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/coworkings" element={<CoworkingsPage />} />
                <Route path="/impact" element={<ImpactPage />} />
                <Route path="/accommodations" element={<AccommodationsPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/mobility" element={<MobilityPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/ambassadors" element={<AmbassadorsPage />} />
                <Route path="/mission" element={<MissionPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/impact-report" element={<ImpactReportPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/become-partner" element={<BecomePartnerPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/reservations" element={<AdminReservations />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/destinations" element={<AdminDestinations />} />
              <Route path="/admin/coworkings" element={<AdminCoworkings />} />
              <Route path="/admin/accommodations" element={<AdminAccommodations />} />
              <Route path="/admin/mobility" element={<AdminMobility />} />
              <Route path="/admin/activities" element={<AdminActivities />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/community" element={<AdminCommunity />} />
              <Route path="/admin/homepage-cta" element={<AdminHomepageCta />} />
              <Route path="/admin/blog" element={<AdminBlog />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/inbox" element={<AdminInbox />} />
              <Route path="/admin/ambassadors" element={<AdminAmbassadors />} />
              <Route path="/admin/impact-content" element={<AdminImpactContent />} />
              <Route path="/admin/carbon-factors" element={<AdminCarbonFactors />} />
              <Route path="/admin/ngos" element={<AdminNgos />} />
              <Route path="/admin/sustainable-actions" element={<AdminSustainableActions />} />
              <Route path="/admin/audit-log" element={<AdminAuditLog />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
