import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import Index from "./pages/Index";
import CarbonCalculatorPage from "./pages/CarbonCalculatorPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import DestinationsPage from "./pages/DestinationsPage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import BookingPage from "./pages/BookingPage";
import CommunityPage from "./pages/CommunityPage";
import CoworkingsPage from "./pages/CoworkingsPage";
import ImpactPage from "./pages/ImpactPage";
import AccommodationsPage from "./pages/AccommodationsPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import MobilityPage from "./pages/MobilityPage";
import BlogPage from "./pages/BlogPage";
import ReviewsPage from "./pages/ReviewsPage";
import EventsPage from "./pages/EventsPage";
import AmbassadorsPage from "./pages/AmbassadorsPage";
import MissionPage from "./pages/MissionPage";
import PartnersPage from "./pages/PartnersPage";
import ImpactReportPage from "./pages/ImpactReportPage";
import HelpPage from "./pages/HelpPage";
import BecomePartnerPage from "./pages/BecomePartnerPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CookiesPage from "./pages/CookiesPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDestinations from "./pages/admin/AdminDestinations";
import AdminCoworkings from "./pages/admin/AdminCoworkings";
import AdminAccommodations from "./pages/admin/AdminAccommodations";
import AdminMobility from "./pages/admin/AdminMobility";
import AdminActivities from "./pages/admin/AdminActivities";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/carbon-calculator" element={<CarbonCalculatorPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
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
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/reservations" element={<AdminReservations />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/destinations" element={<AdminDestinations />} />
            <Route path="/admin/coworkings" element={<AdminCoworkings />} />
            <Route path="/admin/accommodations" element={<AdminAccommodations />} />
            <Route path="/admin/mobility" element={<AdminMobility />} />
            <Route path="/admin/activities" element={<AdminActivities />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
