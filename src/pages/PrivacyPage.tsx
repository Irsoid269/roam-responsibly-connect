import { motion } from "framer-motion";

const PrivacyPage = () => {
  return (
    <main className="page-main">
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Politique de confidentialité
              </h1>
              <p className="text-muted-foreground mb-8">
                Dernière mise à jour : 20 janvier 2026
              </p>

              <div className="prose dark:prose-invert max-w-none space-y-8 prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-accent">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                  <p className="text-muted-foreground mb-4">
                    Amani Resorts ("nous", "notre", "nos") s'engage à protéger la vie privée des utilisateurs 
                    de notre plateforme. Cette politique de confidentialité explique comment nous collectons, 
                    utilisons, partageons et protégeons vos informations personnelles.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Données collectées</h2>
                  <p className="text-muted-foreground mb-4">Nous collectons les catégories de données suivantes :</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                    <li><strong>Données de réservation :</strong> historique des réservations, préférences de voyage</li>
                    <li><strong>Données de paiement :</strong> informations bancaires (traitées par Stripe)</li>
                    <li><strong>Données d'utilisation :</strong> logs de connexion, pages visitées, interactions</li>
                    <li><strong>Données environnementales :</strong> empreinte carbone calculée, compensations effectuées</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Utilisation des données</h2>
                  <p className="text-muted-foreground mb-4">Vos données sont utilisées pour :</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Fournir et améliorer nos services de réservation</li>
                    <li>Calculer votre empreinte carbone et proposer des compensations</li>
                    <li>Communiquer avec vous concernant vos réservations</li>
                    <li>Personnaliser votre expérience utilisateur</li>
                    <li>Respecter nos obligations légales</li>
                    <li>Prévenir la fraude et assurer la sécurité</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Partage des données</h2>
                  <p className="text-muted-foreground mb-4">
                    Nous partageons vos données uniquement avec :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>Nos partenaires :</strong> hébergements, coworkings et activités que vous réservez</li>
                    <li><strong>Prestataires de services :</strong> paiement (Stripe), emailing, hébergement cloud</li>
                    <li><strong>Autorités :</strong> si requis par la loi</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Nous ne vendons jamais vos données personnelles à des tiers.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Conservation des données</h2>
                  <p className="text-muted-foreground mb-4">
                    Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir 
                    nos services et respecter nos obligations légales :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Données de compte : jusqu'à suppression du compte + 3 ans</li>
                    <li>Données de réservation : 10 ans (obligations comptables)</li>
                    <li>Données de navigation : 13 mois maximum</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Vos droits</h2>
                  <p className="text-muted-foreground mb-4">
                    Conformément au RGPD, vous disposez des droits suivants :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>Accès :</strong> obtenir une copie de vos données</li>
                    <li><strong>Rectification :</strong> corriger vos données inexactes</li>
                    <li><strong>Effacement :</strong> demander la suppression de vos données</li>
                    <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
                    <li><strong>Opposition :</strong> vous opposer au traitement de vos données</li>
                    <li><strong>Limitation :</strong> limiter le traitement de vos données</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Pour exercer ces droits, contactez-nous à privacy@amaniresorts.com.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Sécurité</h2>
                  <p className="text-muted-foreground mb-4">
                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
                    appropriées pour protéger vos données :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
                    <li>Stockage sécurisé sur des serveurs en Europe (UE)</li>
                    <li>Accès restreint aux données personnelles</li>
                    <li>Audits de sécurité réguliers</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies</h2>
                  <p className="text-muted-foreground mb-4">
                    Nous utilisons des cookies pour améliorer votre expérience. 
                    Consultez notre <a href="/cookies" className="text-primary hover:underline">Politique cookies</a> pour plus de détails.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact</h2>
                  <p className="text-muted-foreground mb-4">
                    Pour toute question concernant cette politique ou vos données personnelles :
                  </p>
                  <ul className="list-none text-muted-foreground space-y-1">
                    <li>Email : privacy@amaniresorts.com</li>
                    <li>Adresse : Avenue de la Corniche, Moroni, Comores</li>
                    <li>DPO : dpo@amaniresorts.com</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Modifications</h2>
                  <p className="text-muted-foreground">
                    Nous pouvons mettre à jour cette politique de temps en temps. 
                    Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour. 
                    Nous vous informerons par email des changements significatifs.
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
  );
};

export default PrivacyPage;
