import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, ArrowRight, Building2, Home, Bike, Compass, 
  Leaf, Calendar, Check, ShoppingCart, Trash2, Plus, Minus,
  CreditCard, Shield, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCart, type CartItemType } from "@/hooks/useCart";
import HoldCountdown from "@/components/booking/HoldCountdown";
import SlotPickerDialog from "@/components/booking/SlotPickerDialog";
import { offerHasUpcomingSchedules, type OfferSchedule } from "@/hooks/useOfferSchedules";
import StripePaymentForm from "@/components/booking/StripePaymentForm";
import { isStripeConfigured } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";
import BookingConfirmation, {
  type BookingConfirmationData,
} from "@/components/branding/BookingConfirmation";
import BookingEmailPreview from "@/components/branding/BookingEmailTemplate";
import { printAmaniInvoice } from "@/lib/print-invoice";
import { buildBookingConfirmationEmail } from "@/lib/booking-email";
import { persistBooking } from "@/lib/persist-booking";
import EcoScoreLegend from "@/components/carbon/EcoScoreLegend";
import { ecoScoreFromKg } from "@/lib/eco-score";
import {
  useCoworkings,
  useAccommodations,
  useActivities,
  useMobility,
  useDestination,
} from "@/hooks/useCatalogQueries";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useCatalogQueries";
import { toDateInputValue } from "@/lib/search-booking-params";

const BookingPage = () => {
  const { t } = useTranslation("booking");
  const steps = [
    { id: 1, label: t("steps.datesServices"), icon: Calendar },
    { id: 2, label: t("steps.summary"), icon: ShoppingCart },
    { id: 3, label: t("steps.payment"), icon: CreditCard },
  ];
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: destination } = useDestination(id);
  const { data: liveCoworkings } = useCoworkings(id);
  const { data: liveAccommodations } = useAccommodations(id);
  const { data: liveMobility } = useMobility(id);
  const { data: liveActivities } = useActivities(id);

  const coworkings = (liveCoworkings ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    price: Number(c.price_per_day || 0),
    carbonImpact: c.carbon_score === "A" ? 0.3 : c.carbon_score === "C" ? 0.8 : 0.5,
  }));
  const accommodations = (liveAccommodations ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    price: Number(a.price_per_night || 0),
    carbonImpact: a.carbon_score === "A" ? 1.2 : a.carbon_score === "C" ? 3 : 2,
  }));
  const mobilityOptions = (liveMobility ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    price: Number(m.price_per_day || m.price_per_hour || 0),
    carbonImpact: Number(m.carbon_per_km || 0) / 1000,
  }));
  const activities = (liveActivities ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    price: a.price != null ? Number(a.price) : null,
    carbonImpact: Number(a.carbon_impact || 0),
  }));
  
  const {
    items: cart,
    addToCart: addToCartRaw,
    removeFromCart,
    updateQuantity,
    confirmHolds,
    clearCart,
    totalPrice,
    totalCarbon,
  } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [dates, setDates] = useState({
    checkIn: toDateInputValue(searchParams.get("from") || undefined),
    checkOut: toDateInputValue(searchParams.get("to") || undefined),
  });
  const [confirmation, setConfirmation] = useState<BookingConfirmationData | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slotPickerItem, setSlotPickerItem] = useState<{
    id: string;
    type: CartItemType;
    name: string;
    price: number;
    carbonImpact: number;
  } | null>(null);

  const addToCart = async (
    item: Parameters<typeof addToCartRaw>[0],
  ) => {
    try {
      await addToCartRaw(item);
      toast({
        title: t("toast.added"),
        description: item.name,
      });
    } catch (err) {
      toast({
        title: t("toast.unavailable"),
        description:
          err instanceof Error ? err.message : t("toast.unavailableDefault"),
        variant: "destructive",
      });
    }
  };

  /** Only offers a slot picker when the item actually has bookable schedules —
   * everything else keeps adding to the cart instantly, unchanged. */
  const handleAddClick = async (item: {
    id: string;
    type: CartItemType;
    name: string;
    price: number;
    carbonImpact: number;
  }) => {
    const hasSlots = await offerHasUpcomingSchedules(item.id);
    if (hasSlots) {
      setSlotPickerItem(item);
      return;
    }
    await addToCart(item);
  };

  const handleSlotConfirm = async (schedule: OfferSchedule) => {
    if (!slotPickerItem) return;
    await addToCart({
      ...slotPickerItem,
      price: schedule.price_eur ?? slotPickerItem.price,
      scheduleId: schedule.id,
    });
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({
        title: t("toast.loginRequired"),
        description: t("toast.loginRequiredDesc"),
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!dates.checkIn || !dates.checkOut) {
      toast({
        title: t("toast.datesRequired"),
        description: t("toast.datesRequiredDesc"),
        variant: "destructive",
      });
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const result = await persistBooking({
        userId: user.id,
        destinationId: id && id.length > 20 ? id : null,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        items: cart,
        guestName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Voyageur",
        guestEmail: user.email || "hello@amaniresorts.com",
        destinationLabel: destination?.name || "Comores",
      });

      // The reservation now exists for good: freeze any held slots (so they
      // don't silently expire and free up capacity) instead of releasing them.
      await confirmHolds();
      clearCart();

      buildBookingConfirmationEmail(result.confirmation);
      setConfirmation(result.confirmation);
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(user.id) });
      toast({
        title: t("toast.confirmed"),
        description: t("toast.confirmedDesc", { ref: result.confirmation.reference }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : t("toast.failedDefault");
      toast({
        title: t("toast.failed"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const typeIcons = {
    coworking: Building2,
    accommodation: Home,
    mobility: Bike,
    activity: Compass,
  };

  return (
    <>
    <main className="page-main">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back")}
            </Button>
            <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 ${
                    currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 md:w-24 h-0.5 mx-2 ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Dates */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        {t("dates.title")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t("dates.checkIn")}</Label>
                          <Input
                            type="date"
                            value={dates.checkIn}
                            onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>{t("dates.checkOut")}</Label>
                          <Input
                            type="date"
                            value={dates.checkOut}
                            onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Coworkings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        {t("sections.coworking")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {coworkings.map((space) => (
                        <div key={space.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                          <div>
                            <p className="font-medium">{space.name}</p>
                            <p className="text-sm text-muted-foreground">{space.price}{t("perDay")}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-carbon">
                              <Leaf className="w-3 h-3 mr-1" />
                              {space.carbonImpact} kg
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => handleAddClick({
                                id: space.id,
                                type: "coworking",
                                name: space.name,
                                price: space.price,
                                carbonImpact: space.carbonImpact,
                              })}
                            >
                              {t("add")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Accommodations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-secondary" />
                        {t("sections.accommodation")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {accommodations.map((accom) => (
                        <div key={accom.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                          <div>
                            <p className="font-medium">{accom.name}</p>
                            <p className="text-sm text-muted-foreground">{accom.price}{t("perNight")}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-carbon">
                              <Leaf className="w-3 h-3 mr-1" />
                              {accom.carbonImpact} kg
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => handleAddClick({
                                id: accom.id,
                                type: "accommodation",
                                name: accom.name,
                                price: accom.price,
                                carbonImpact: accom.carbonImpact,
                              })}
                            >
                              {t("add")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Mobility */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bike className="w-5 h-5 text-accent" />
                        {t("sections.mobility")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mobilityOptions.map((mob) => (
                        <div key={mob.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                          <div>
                            <p className="font-medium">{mob.name}</p>
                            <p className="text-sm text-muted-foreground">{mob.price}{t("perDay")}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-success">
                              <Leaf className="w-3 h-3 mr-1" />
                              {mob.carbonImpact === 0 ? t("zeroEmission") : `${mob.carbonImpact} kg`}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => handleAddClick({
                                id: mob.id,
                                type: "mobility",
                                name: mob.name,
                                price: mob.price,
                                carbonImpact: mob.carbonImpact,
                              })}
                            >
                              {t("add")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Activities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-carbon" />
                        {t("sections.activity")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activities.map((act) => (
                        <div key={act.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {act.name}
                                <Badge className="bg-eco-a text-primary-foreground text-xs">{t("eco")}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {act.price != null ? `${act.price}€` : t("priceUpcoming")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-carbon">
                              <Leaf className="w-3 h-3 mr-1" />
                              {act.carbonImpact} kg
                            </Badge>
                            <Button
                              size="sm"
                              disabled={act.price == null}
                              onClick={() => handleAddClick({
                                id: act.id,
                                type: "activity",
                                name: act.name,
                                price: act.price ?? 0,
                                carbonImpact: act.carbonImpact,
                              })}
                            >
                              {t("add")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("summaryTitle")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cart.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          {t("emptyCart")}
                        </p>
                      ) : (
                        cart.map((item) => {
                          const Icon = typeIcons[item.type];
                          return (
                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">{item.price}€ × {item.quantity}</p>
                                  {item.holdExpiresAt && (
                                    <HoldCountdown expiresAt={item.holdExpiresAt} className="mt-1" />
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    disabled={!!item.holdId}
                                    onClick={() => updateQuantity(item.id, -1)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    disabled={!!item.holdId}
                                    onClick={() => updateQuantity(item.id, 1)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                <p className="font-semibold w-16 text-right">{item.price * item.quantity}€</p>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {t("payment.title")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isStripeConfigured && (
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                          <p className="font-medium">{t("payment.securePayment")}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("payment.stripeSoon")}
                          </p>
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t("payment.subtotal")}</span>
                          <span>{totalPrice}€</span>
                        </div>
                        <div className="flex justify-between text-sm text-carbon">
                          <span className="flex items-center gap-1">
                            <Leaf className="w-4 h-4" />
                            {t("payment.carbonOffset")}
                          </span>
                          <span>{(totalCarbon * 2).toFixed(2)}€</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>{t("payment.total")}</span>
                          <span>{(totalPrice + totalCarbon * 2).toFixed(2)}€</span>
                        </div>
                      </div>

                      {isStripeConfigured ? (
                        <StripePaymentForm
                          amount={Number((totalPrice + totalCarbon * 2).toFixed(2))}
                          holdIds={cart.filter((c) => c.holdId).map((c) => c.holdId!)}
                          onSuccess={handleConfirmBooking}
                          onError={(message) =>
                            toast({ title: t("payment.declined"), description: message, variant: "destructive" })
                          }
                        />
                      ) : (
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleConfirmBooking}
                          disabled={cart.length === 0 || submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t("payment.saving")}
                            </>
                          ) : (
                            t("payment.confirm")
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("nav.previous")}
                </Button>
                {currentStep < 3 && (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={cart.length === 0}
                  >
                    {t("nav.next")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Sidebar - Cart Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      {t("cart.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t("cart.empty")}
                      </p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm gap-2">
                            <span className="text-muted-foreground">
                              {item.name} × {item.quantity}
                              {item.holdExpiresAt && (
                                <HoldCountdown expiresAt={item.holdExpiresAt} className="ml-2" />
                              )}
                            </span>
                            <span className="shrink-0">{item.price * item.quantity}€</span>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>{t("cart.total")}</span>
                          <span>{totalPrice}€</span>
                        </div>
                      </>
                    )}

                    {/* Carbon Impact */}
                    <div className="p-4 bg-carbon-light rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-carbon" />
                        <span className="font-medium text-carbon">{t("carbonImpact.title")}</span>
                      </div>
                      <p className="text-2xl font-display font-medium text-carbon">
                        {totalCarbon.toFixed(1)} kg CO₂
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("carbonImpact.scoreLabel", { grade: ecoScoreFromKg(totalCarbon).grade })}
                      </p>
                      <EcoScoreLegend compact />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={!!confirmation} onOpenChange={(open) => !open && setConfirmation(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-border bg-background">
          {confirmation && (
            <div className="space-y-4 p-1">
              <BookingConfirmation
                data={confirmation}
                onDownloadInvoice={() => {
                  const result = printAmaniInvoice(confirmation);
                  if (!result.ok) {
                    toast({
                      title: t("toast.invoiceUnavailable"),
                      description: result.reason,
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: t("toast.invoiceGenerated"),
                    description:
                      result.mode === "print"
                        ? t("toast.invoicePrint")
                        : t("toast.invoiceDownloaded"),
                  });
                }}
                onClose={() => {
                  setConfirmation(null);
                  navigate("/profile");
                }}
              />
              <div className="px-4 pb-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowEmailPreview((v) => !v)}
                >
                  {showEmailPreview ? t("confirmation.hideEmail") : t("confirmation.previewEmail")}{" "}
                  {t("confirmation.emailSuffix")}
                </Button>
                {showEmailPreview && (
                  <div className="mt-3">
                    <BookingEmailPreview data={confirmation} />
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {slotPickerItem && (
        <SlotPickerDialog
          open={!!slotPickerItem}
          onOpenChange={(open) => !open && setSlotPickerItem(null)}
          offerId={slotPickerItem.id}
          offerName={slotPickerItem.name}
          fallbackPrice={slotPickerItem.price}
          onConfirm={handleSlotConfirm}
        />
      )}
    </>
  );
};

export default BookingPage;
