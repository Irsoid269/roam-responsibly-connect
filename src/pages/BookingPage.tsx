import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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

interface CartItem {
  id: string;
  type: "coworking" | "accommodation" | "mobility" | "activity";
  name: string;
  price: number;
  quantity: number;
  carbonImpact: number;
}

const steps = [
  { id: 1, label: "Dates & Services", icon: Calendar },
  { id: 2, label: "Récapitulatif", icon: ShoppingCart },
  { id: 3, label: "Paiement", icon: CreditCard },
];

const BookingPage = () => {
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
    price: Number(a.price || 0),
    carbonImpact: Number(a.carbon_impact || 0),
  }));
  
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dates, setDates] = useState({
    checkIn: toDateInputValue(searchParams.get("from") || undefined),
    checkOut: toDateInputValue(searchParams.get("to") || undefined),
  });
  const [confirmation, setConfirmation] = useState<BookingConfirmationData | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(cart.map((c) => 
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast({
      title: "Ajouté au panier",
      description: item.name,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map((c) => {
      if (c.id === itemId) {
        const newQty = Math.max(1, c.quantity + delta);
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCarbon = cart.reduce((sum, item) => sum + item.carbonImpact * item.quantity, 0);

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour finaliser votre réservation",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!dates.checkIn || !dates.checkOut) {
      toast({
        title: "Dates requises",
        description: "Indiquez vos dates d'arrivée et de départ",
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

      buildBookingConfirmationEmail(result.confirmation);
      setConfirmation(result.confirmation);
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(user.id) });
      toast({
        title: "Réservation confirmée — Amani Resorts",
        description: `Réf. ${result.confirmation.reference} · Enregistrée dans votre espace`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la réservation";
      toast({
        title: "Échec de la réservation",
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
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Composer mon séjour</h1>
            <p className="text-muted-foreground mt-1">Sélectionnez vos services pour créer votre expérience idéale</p>
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
                        Dates du séjour
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Arrivée</Label>
                          <Input
                            type="date"
                            value={dates.checkIn}
                            onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Départ</Label>
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
                        Espaces de coworking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {coworkings.map((space) => (
                        <div key={space.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                          <div>
                            <p className="font-medium">{space.name}</p>
                            <p className="text-sm text-muted-foreground">{space.price}€/jour</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-carbon">
                              <Leaf className="w-3 h-3 mr-1" />
                              {space.carbonImpact} kg
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => addToCart({
                                id: space.id,
                                type: "coworking",
                                name: space.name,
                                price: space.price,
                                carbonImpact: space.carbonImpact,
                              })}
                            >
                              Ajouter
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
                        Hébergements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {accommodations.map((accom) => (
                        <div key={accom.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                          <div>
                            <p className="font-medium">{accom.name}</p>
                            <p className="text-sm text-muted-foreground">{accom.price}€/nuit</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-carbon">
                              <Leaf className="w-3 h-3 mr-1" />
                              {accom.carbonImpact} kg
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => addToCart({
                                id: accom.id,
                                type: "accommodation",
                                name: accom.name,
                                price: accom.price,
                                carbonImpact: accom.carbonImpact,
                              })}
                            >
                              Ajouter
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
                        Mobilité douce
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mobilityOptions.map((mob) => (
                        <div key={mob.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                          <div>
                            <p className="font-medium">{mob.name}</p>
                            <p className="text-sm text-muted-foreground">{mob.price}€/jour</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-success">
                              <Leaf className="w-3 h-3 mr-1" />
                              {mob.carbonImpact === 0 ? "0 émission" : `${mob.carbonImpact} kg`}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => addToCart({
                                id: mob.id,
                                type: "mobility",
                                name: mob.name,
                                price: mob.price,
                                carbonImpact: mob.carbonImpact,
                              })}
                            >
                              Ajouter
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
                        Activités
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activities.map((act) => (
                        <div key={act.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {act.name}
                                <Badge className="bg-eco-a text-primary-foreground text-xs">Éco</Badge>
                              </p>
                              <p className="text-sm text-muted-foreground">{act.price}€</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-carbon">
                              <Leaf className="w-3 h-3 mr-1" />
                              {act.carbonImpact} kg
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => addToCart({
                                id: act.id,
                                type: "activity",
                                name: act.name,
                                price: act.price,
                                carbonImpact: act.carbonImpact,
                              })}
                            >
                              Ajouter
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
                      <CardTitle>Récapitulatif de votre séjour</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cart.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Votre panier est vide. Ajoutez des services pour continuer.
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
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, -1)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
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
                        Paiement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <p className="font-medium">Paiement sécurisé</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          L'intégration Stripe sera disponible prochainement
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Sous-total</span>
                          <span>{totalPrice}€</span>
                        </div>
                        <div className="flex justify-between text-sm text-carbon">
                          <span className="flex items-center gap-1">
                            <Leaf className="w-4 h-4" />
                            Compensation carbone
                          </span>
                          <span>{(totalCarbon * 2).toFixed(2)}€</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>{(totalPrice + totalCarbon * 2).toFixed(2)}€</span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleConfirmBooking}
                        disabled={cart.length === 0 || submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enregistrement…
                          </>
                        ) : (
                          "Confirmer la réservation"
                        )}
                      </Button>
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
                  Précédent
                </Button>
                {currentStep < 3 && (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={cart.length === 0}
                  >
                    Suivant
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
                      Votre panier
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun service sélectionné
                      </p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.name} × {item.quantity}
                            </span>
                            <span>{item.price * item.quantity}€</span>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{totalPrice}€</span>
                        </div>
                      </>
                    )}

                    {/* Carbon Impact */}
                    <div className="p-4 bg-carbon-light rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-carbon" />
                        <span className="font-medium text-carbon">Impact carbone</span>
                      </div>
                      <p className="text-2xl font-display font-medium text-carbon">
                        {totalCarbon.toFixed(1)} kg CO₂
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score {ecoScoreFromKg(totalCarbon).grade} · Compensation incluse
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
                      title: "Facture indisponible",
                      description: result.reason,
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "Facture générée",
                    description:
                      result.mode === "print"
                        ? "Fenêtre ouverte — Imprimer ou enregistrer en PDF"
                        : "Fichier HTML téléchargé sur votre appareil",
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
                  {showEmailPreview ? "Masquer" : "Aperçu"} email de confirmation Amani
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
    </>
  );
};

export default BookingPage;
