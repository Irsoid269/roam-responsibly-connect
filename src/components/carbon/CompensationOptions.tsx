import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Heart, 
  TreePine, 
  HandHeart, 
  CheckCircle2, 
  ArrowRight,
  Leaf,
  Globe,
  Users,
  Calendar,
  MapPin,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EcoScoreLegend from "@/components/carbon/EcoScoreLegend";
import { ecoScoreFromKg } from "@/lib/eco-score";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  useActiveNgos,
  useCreateDonation,
  useUpcomingActionSessions,
  useRegisterForAction,
} from "@/hooks/useCatalogQueries";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface CompensationOptionsProps {
  totalCO2: number;
}

const CompensationOptions = ({ totalCO2 }: CompensationOptionsProps) => {
  const { t, i18n } = useTranslation("carbonCalculator");
  const dateLocale = i18n.language === "en" ? enUS : fr;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ngos = [] } = useActiveNgos();
  const createDonation = useCreateDonation();

  const [selectedTab, setSelectedTab] = useState<"donation" | "action">("donation");
  const [selectedAssociation, setSelectedAssociation] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [donated, setDonated] = useState(false);

  // Calculate suggested donation (approximately €25 per tonne of CO2)
  const suggestedAmount = Math.round((totalCO2 / 1000) * 25);
  const defaultAmount = Math.max(suggestedAmount, 5);

  const handleDonate = async () => {
    if (!user) {
      toast.error(t("compensation.loginRequiredDonation"));
      navigate("/login");
      return;
    }
    if (!selectedAssociation) return;
    const amount = customAmount || defaultAmount;
    try {
      await createDonation.mutateAsync({
        userId: user.id,
        ngoId: selectedAssociation,
        amount,
        co2OffsetKg: totalCO2,
      });
      setDonated(true);
      toast.success(t("compensation.donationSaved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("compensation.donationError"));
    }
  };

  const { data: actionSessions = [] } = useUpcomingActionSessions();
  const registerForAction = useRegisterForAction();
  const [registeredQr, setRegisteredQr] = useState<string | null>(null);

  const categoryEmoji: Record<string, string> = {
    plantation: "🌲",
    nettoyage: "🏖️",
    sensibilisation: "♻️",
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error(t("compensation.loginRequiredAction"));
      navigate("/login");
      return;
    }
    if (!selectedAction) return;
    try {
      const participation = await registerForAction.mutateAsync(selectedAction);
      setRegisteredQr((participation as { qr_code: string }).qr_code);
      toast.success(t("compensation.registrationConfirmed"));
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      const messages: Record<string, string> = {
        already_registered: t("compensation.alreadyRegistered"),
        session_full: t("compensation.sessionFull"),
        session_not_found: t("compensation.sessionNotFound"),
      };
      toast.error(messages[code] || t("compensation.registrationError"));
    }
  };

  const donationAmounts = [5, 10, 20, 50];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-carbon-saved/20 to-carbon-offset/20 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-carbon-saved/20 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-carbon-saved" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-medium">{t("compensation.title")}</h3>
            <p className="text-muted-foreground">{t("compensation.subtitle")}</p>
          </div>
        </div>

        <div className="mb-4">
          <EcoScoreLegend />
          <p className="mt-2 text-xs text-muted-foreground">
            {t("compensation.estimatedFootprint", { total: totalCO2, grade: ecoScoreFromKg(totalCO2).grade })}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-background/50 rounded-xl p-1">
          <button
            onClick={() => setSelectedTab("donation")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
              selectedTab === "donation"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className="w-4 h-4" />
            {t("compensation.donationTab")}
          </button>
          <button
            onClick={() => setSelectedTab("action")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
              selectedTab === "action"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HandHeart className="w-4 h-4" />
            {t("compensation.actionTab")}
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {selectedTab === "donation" ? (
            <motion.div
              key="donation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Suggested Amount */}
              <div className="bg-carbon-saved/10 rounded-xl p-4 border border-carbon-saved/20">
                <div className="flex items-center gap-2 mb-2">
                  <TreePine className="w-5 h-5 text-carbon-saved" />
                  <span className="font-medium">{t("compensation.suggestedTitle")}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("compensation.suggestedBody", { total: totalCO2 })}
                  <strong className="text-foreground"> {defaultAmount}€</strong>
                </p>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">{t("compensation.donationAmount")}</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {donationAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCustomAmount(amount)}
                      className={cn(
                        "py-3 rounded-lg font-medium transition-all",
                        customAmount === amount
                          ? "bg-carbon-saved text-carbon-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {amount}€
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={customAmount || ""}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    placeholder={t("compensation.customAmount")}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-carbon-saved/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                </div>
              </div>

              {/* Associations */}
              {donated ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-carbon-saved mx-auto" />
                  <p className="font-medium">{t("compensation.donationThanks")}</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {t("compensation.donationThanksBody")}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-3 block">{t("compensation.chooseAssociation")}</label>
                    {ngos.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t("compensation.noNgos")}
                      </p>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-3">
                        {ngos.map((ngo) => (
                          <button
                            key={ngo.id}
                            onClick={() => setSelectedAssociation(ngo.id)}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all",
                              selectedAssociation === ngo.id
                                ? "border-carbon-saved bg-carbon-saved/5"
                                : "border-border hover:border-carbon-saved/50"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">{ngo.logo_url}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{ngo.name}</span>
                                  <CheckCircle2 className="w-4 h-4 text-carbon-saved" />
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{ngo.description}</p>
                                {ngo.impact_label && (
                                  <p className="text-xs text-carbon-saved mt-2">{ngo.impact_label}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    variant="carbon"
                    size="lg"
                    className="w-full gap-2"
                    disabled={!selectedAssociation || createDonation.isPending}
                    onClick={handleDonate}
                  >
                    <Heart className="w-5 h-5" />
                    {t("compensation.donateButton", { amount: customAmount || defaultAmount })}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {t("compensation.donationNote")}
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="action"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Info */}
              <div className="bg-carbon-offset/10 rounded-xl p-4 border border-carbon-offset/20">
                <div className="flex items-center gap-2 mb-2">
                  <HandHeart className="w-5 h-5 text-carbon-offset" />
                  <span className="font-medium">{t("compensation.actOnGroundTitle")}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("compensation.actOnGroundBody")}
                </p>
              </div>

              {registeredQr ? (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-carbon-offset mx-auto" />
                  <p className="font-medium">{t("compensation.registrationConfirmedTitle")}</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {t("compensation.registrationConfirmedBody")}
                  </p>
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-xl border border-border">
                      <QRCodeSVG value={registeredQr} size={180} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Actions List */}
                  <div className="space-y-4">
                    {actionSessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t("compensation.noSessions")}
                      </p>
                    ) : (
                      actionSessions.map((session) => {
                        const full = session.registered_count >= session.capacity;
                        return (
                          <button
                            key={session.id}
                            disabled={full}
                            onClick={() => setSelectedAction(session.id)}
                            className={cn(
                              "w-full p-4 rounded-xl border-2 text-left transition-all",
                              full && "opacity-50 cursor-not-allowed",
                              selectedAction === session.id
                                ? "border-carbon-offset bg-carbon-offset/5"
                                : "border-border hover:border-carbon-offset/50"
                            )}
                          >
                            <div className="flex gap-4">
                              <span className="text-4xl">
                                {categoryEmoji[session.sustainable_actions?.category || ""] || "🌍"}
                              </span>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">{session.sustainable_actions?.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {session.sustainable_actions?.description}
                                </p>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  {session.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {session.location}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(session.starts_at), "d MMMM yyyy", { locale: dateLocale })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {full
                                      ? t("compensation.full")
                                      : t("compensation.participants", { count: session.registered_count, capacity: session.capacity })}
                                  </span>
                                </div>
                                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-carbon-offset rounded-full"
                                    style={{
                                      width: `${(session.registered_count / session.capacity) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    variant="warm"
                    size="lg"
                    className="w-full gap-2"
                    disabled={!selectedAction || registerForAction.isPending}
                    onClick={handleRegister}
                  >
                    <HandHeart className="w-5 h-5" />
                    {t("compensation.registerButton")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CompensationOptions;
