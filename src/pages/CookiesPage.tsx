import { motion } from "framer-motion";
import { Cookie, Shield, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const cookieTypes = [
  {
    icon: Shield,
    title: "Cookies essentiels",
    description: "Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.",
    required: true,
    examples: ["Session utilisateur", "Panier de réservation", "Préférences de langue"],
  },
  {
    icon: BarChart3,
    title: "Cookies analytiques",
    description: "Nous aident à comprendre comment vous utilisez le site pour l'améliorer.",
    required: false,
    examples: ["Google Analytics", "Hotjar", "Statistiques de navigation"],
  },
  {
    icon: Settings,
    title: "Cookies fonctionnels",
    description: "Permettent des fonctionnalités avancées et une personnalisation.",
    required: false,
    examples: ["Préférences de recherche", "Historique récent", "Recommandations"],
  },
  {
    icon: Cookie,
    title: "Cookies marketing",
    description: "Utilisés pour vous montrer des publicités pertinentes.",
    required: false,
    examples: ["Facebook Pixel", "Google Ads", "Retargeting"],
  },
];

const CookiesPage = () => {
  return (
    <main className="page-main">
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Politique des cookies
              </h1>
              <p className="text-muted-foreground mb-8">
                Dernière mise à jour : 20 janvier 2026
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Qu'est-ce qu'un cookie ?</h2>
                  <p className="text-muted-foreground mb-4">
                    Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, 
                    tablette) lors de la visite d'un site web. Il permet de stocker des informations relatives 
                    à votre navigation et de vous reconnaître lors de vos prochaines visites.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Types de cookies utilisés</h2>
                  <div className="space-y-4">
                    {cookieTypes.map((type, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <type.icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{type.title}</CardTitle>
                              </div>
                            </div>
                            <Switch 
                              checked={type.required || undefined} 
                              disabled={type.required}
                            />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {type.examples.map((example, i) => (
                              <span 
                                key={i} 
                                className="text-xs bg-muted px-2 py-1 rounded"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Durée de conservation</h2>
                  <p className="text-muted-foreground mb-4">
                    La durée de conservation des cookies varie selon leur type :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
                    <li><strong>Cookies persistants :</strong> conservés jusqu'à 13 mois maximum</li>
                    <li><strong>Cookies tiers :</strong> durée définie par le tiers concerné</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Gérer vos préférences</h2>
                  <p className="text-muted-foreground mb-4">
                    Vous pouvez à tout moment modifier vos préférences en matière de cookies :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                    <li>Via le bandeau cookies lors de votre première visite</li>
                    <li>Via les paramètres de votre navigateur</li>
                    <li>En cliquant sur le bouton ci-dessous</li>
                  </ul>
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    Gérer mes préférences cookies
                  </Button>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Configuration du navigateur</h2>
                  <p className="text-muted-foreground mb-4">
                    Vous pouvez configurer votre navigateur pour accepter ou refuser les cookies. 
                    Voici les liens vers les instructions des principaux navigateurs :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><a href="#" className="text-primary hover:underline">Google Chrome</a></li>
                    <li><a href="#" className="text-primary hover:underline">Mozilla Firefox</a></li>
                    <li><a href="#" className="text-primary hover:underline">Apple Safari</a></li>
                    <li><a href="#" className="text-primary hover:underline">Microsoft Edge</a></li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Note : la désactivation de certains cookies peut affecter le fonctionnement du site.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
                  <p className="text-muted-foreground">
                    Pour toute question concernant notre utilisation des cookies :<br />
                    Email : privacy@amaniresorts.com
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
  );
};

export default CookiesPage;
