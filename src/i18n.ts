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
      },
      en: {
        common: enCommon,
        home: enHome,
        destinations: enDestinations,
        booking: enBooking,
        community: enCommunity,
        reviews: enReviews,
      },
      zdj: { common: zdjCommon },
    },
    ns: ["common", "home", "destinations", "booking", "community", "reviews"],
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
