import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import frCommon from "@/locales/fr/common.json";
import enCommon from "@/locales/en/common.json";
import zdjCommon from "@/locales/zdj/common.json";
import frHome from "@/locales/fr/home.json";
import enHome from "@/locales/en/home.json";
import frDestinations from "@/locales/fr/destinations.json";
import enDestinations from "@/locales/en/destinations.json";
import frBooking from "@/locales/fr/booking.json";
import enBooking from "@/locales/en/booking.json";
import frCommunity from "@/locales/fr/community.json";
import enCommunity from "@/locales/en/community.json";
import frReviews from "@/locales/fr/reviews.json";
import enReviews from "@/locales/en/reviews.json";
import frNotFound from "@/locales/fr/notFound.json";
import enNotFound from "@/locales/en/notFound.json";
import frAuthPages from "@/locales/fr/authPages.json";
import enAuthPages from "@/locales/en/authPages.json";
import frProfile from "@/locales/fr/profile.json";
import enProfile from "@/locales/en/profile.json";
import frCarbonCalculator from "@/locales/fr/carbonCalculator.json";
import enCarbonCalculator from "@/locales/en/carbonCalculator.json";
import frContact from "@/locales/fr/contact.json";
import enContact from "@/locales/en/contact.json";
import frFaq from "@/locales/fr/faq.json";
import enFaq from "@/locales/en/faq.json";
import frHelp from "@/locales/fr/help.json";
import enHelp from "@/locales/en/help.json";
import frBlog from "@/locales/fr/blog.json";
import enBlog from "@/locales/en/blog.json";
import frCoworkings from "@/locales/fr/coworkings.json";
import enCoworkings from "@/locales/en/coworkings.json";
import frActivities from "@/locales/fr/activities.json";
import enActivities from "@/locales/en/activities.json";
import frAccommodations from "@/locales/fr/accommodations.json";
import enAccommodations from "@/locales/en/accommodations.json";
import frMobility from "@/locales/fr/mobility.json";
import enMobility from "@/locales/en/mobility.json";
import frEvents from "@/locales/fr/events.json";
import enEvents from "@/locales/en/events.json";
import frMission from "@/locales/fr/mission.json";
import enMission from "@/locales/en/mission.json";
import frImpact from "@/locales/fr/impact.json";
import enImpact from "@/locales/en/impact.json";
import frImpactReport from "@/locales/fr/impactReport.json";
import enImpactReport from "@/locales/en/impactReport.json";
import frAmbassadors from "@/locales/fr/ambassadors.json";
import enAmbassadors from "@/locales/en/ambassadors.json";
import frPartners from "@/locales/fr/partners.json";
import enPartners from "@/locales/en/partners.json";
import frBecomePartner from "@/locales/fr/becomePartner.json";
import enBecomePartner from "@/locales/en/becomePartner.json";
import frCookies from "@/locales/fr/cookies.json";
import enCookies from "@/locales/en/cookies.json";
import frPrivacy from "@/locales/fr/privacy.json";
import enPrivacy from "@/locales/en/privacy.json";
import frTerms from "@/locales/fr/terms.json";
import enTerms from "@/locales/en/terms.json";

export const SUPPORTED_LANGUAGES = ["fr", "en", "zdj"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common: frCommon,
        home: frHome,
        destinations: frDestinations,
        booking: frBooking,
        community: frCommunity,
        reviews: frReviews,
        notFound: frNotFound,
        authPages: frAuthPages,
        profile: frProfile,
        carbonCalculator: frCarbonCalculator,
        contact: frContact,
        faq: frFaq,
        help: frHelp,
        blog: frBlog,
        coworkings: frCoworkings,
        activities: frActivities,
        accommodations: frAccommodations,
        mobility: frMobility,
        events: frEvents,
        mission: frMission,
        impact: frImpact,
        impactReport: frImpactReport,
        ambassadors: frAmbassadors,
        partners: frPartners,
        becomePartner: frBecomePartner,
        cookies: frCookies,
        privacy: frPrivacy,
        terms: frTerms,
      },
      en: {
        common: enCommon,
        home: enHome,
        destinations: enDestinations,
        booking: enBooking,
        community: enCommunity,
        reviews: enReviews,
        notFound: enNotFound,
        authPages: enAuthPages,
        profile: enProfile,
        carbonCalculator: enCarbonCalculator,
        contact: enContact,
        faq: enFaq,
        help: enHelp,
        blog: enBlog,
        coworkings: enCoworkings,
        activities: enActivities,
        accommodations: enAccommodations,
        mobility: enMobility,
        events: enEvents,
        mission: enMission,
        impact: enImpact,
        impactReport: enImpactReport,
        ambassadors: enAmbassadors,
        partners: enPartners,
        becomePartner: enBecomePartner,
        cookies: enCookies,
        privacy: enPrivacy,
        terms: enTerms,
      },
      zdj: { common: zdjCommon },
    },
    ns: [
      "common", "home", "destinations", "booking", "community", "reviews",
      "notFound", "authPages", "profile", "carbonCalculator", "contact", "faq", "help", "blog",
      "coworkings", "activities", "accommodations", "mobility", "events", "mission", "impact",
      "impactReport", "ambassadors", "partners", "becomePartner", "cookies", "privacy", "terms",
    ],
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    fallbackLng: "fr",
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "amani-language",
    },
  });

export default i18n;
