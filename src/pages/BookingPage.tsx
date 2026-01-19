import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, Building2, Home, Bike, Compass, 
  Leaf, Calendar, Check, ShoppingCart, Trash2, Plus, Minus,
  CreditCard, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

// Mock services
const mockCoworkings = [
  { id: "c1", name: "Heden Lisboa", price: 25, carbonImpact: 0.5 },
  { id: "c2", name: "Second Home", price: 35, carbonImpact: 0.3 },
];

const mockAccommodations = [
  { id: "a1", name: "Selina Secret Garden", price: 45, carbonImpact: 2.5 },
  { id: "a2", name: "Eco Hostel Alfama", price: 25, carbonImpact: 1.2 },
];

const mockMobility = [
  { id: "m1", name: "Vélo électrique", price: 15, carbonImpact: 0 },
  { id: "m2", name: "Scooter électrique", price: 25, carbonImpact: 0.1 },
];

const mockActivities = [
  { id: "act1", name: "Tour vélo électrique", price: 35, carbonImpact: 0.2, eco: true },
  { id: "act2", name: "Visite Sintra", price: 55, carbonImpact: 3.5, eco: true },
];

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });

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

  const handleConfirmBooking = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour finaliser votre réservation",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    toast({
      title: "Réservation confirmée !",
      description: "Vous recevrez un email de confirmation",
    });
    navigate("/profile");
  };

  const typeIcons = {
    coworking: Building2,
    accommodation: Home,
    mobility: Bike,
    activity: Compass,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
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
                      {mockCoworkings.map((space) => (
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
                      {mockAccommodations.map((accom) => (
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
                      {mockMobility.map((mob) => (
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
                      {mockActivities.map((act) => (
                        <div key={act.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {act.name}
                                {act.eco && (
                                  <Badge className="bg-carbon text-carbon-foreground text-xs">Éco</Badge>
                                )}
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
                        disabled={cart.length === 0}
                      >
                        Confirmer la réservation
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
                    <div className="p-4 bg-carbon-light rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-5 h-5 text-carbon" />
                        <span className="font-medium text-carbon">Impact carbone</span>
                      </div>
                      <p className="text-2xl font-bold text-carbon">
                        {totalCarbon.toFixed(1)} kg CO₂
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Compensation incluse dans le prix
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
