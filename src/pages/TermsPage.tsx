import { motion } from "framer-motion";

const TermsPage = () => {
  return (
    <main className="page-main">
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Conditions Générales d'Utilisation
              </h1>
              <p className="text-muted-foreground mb-8">
                Dernière mise à jour : 20 janvier 2026
              </p>

              <div className="prose dark:prose-invert max-w-none space-y-8 prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-accent">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Objet</h2>
                  <p className="text-muted-foreground mb-4">
                    Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la 
                    plateforme Amani Resorts, accessible à l'adresse amaniresorts.com, qui propose des services 
                    de réservation d'hébergements, d'espaces de coworking et d'activités pour les nomades 
                    digitaux et télétravailleurs aux Comores.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Définitions</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>Plateforme :</strong> le site web et l'application Amani Resorts</li>
                    <li><strong>Utilisateur :</strong> toute personne utilisant la Plateforme</li>
                    <li><strong>Membre :</strong> Utilisateur disposant d'un compte</li>
                    <li><strong>Partenaire :</strong> hébergement, coworking ou prestataire d'activités</li>
                    <li><strong>Services :</strong> l'ensemble des prestations proposées via la Plateforme</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Accès et inscription</h2>
                  <p className="text-muted-foreground mb-4">
                    L'accès à la Plateforme est gratuit. Certaines fonctionnalités nécessitent la création 
                    d'un compte. L'Utilisateur s'engage à fournir des informations exactes et à maintenir 
                    la confidentialité de ses identifiants.
                  </p>
                  <p className="text-muted-foreground">
                    L'inscription est réservée aux personnes majeures. Amani Resorts se réserve le droit de 
                    suspendre ou supprimer tout compte en cas de violation des présentes CGU.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Services proposés</h2>
                  <p className="text-muted-foreground mb-4">
                    Amani Resorts agit en qualité d'intermédiaire entre les Utilisateurs et les Partenaires. 
                    Nos services comprennent :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Réservation d'hébergements éco-responsables</li>
                    <li>Réservation d'espaces de coworking</li>
                    <li>Réservation d'activités et expériences</li>
                    <li>Calcul d'empreinte carbone</li>
                    <li>Compensation carbone via des projets certifiés</li>
                    <li>Mise en relation avec la communauté</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Réservations</h2>
                  <p className="text-muted-foreground mb-4">
                    Toute réservation effectuée via la Plateforme constitue un contrat entre l'Utilisateur 
                    et le Partenaire concerné. Amani Resorts n'est pas partie à ce contrat.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Les prix affichés incluent toutes les taxes applicables. Le paiement s'effectue 
                    intégralement au moment de la réservation, sauf option de paiement en plusieurs fois.
                  </p>
                  <p className="text-muted-foreground">
                    Les conditions d'annulation et de modification sont propres à chaque Partenaire et 
                    indiquées lors de la réservation.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Compensation carbone</h2>
                  <p className="text-muted-foreground mb-4">
                    Les contributions à la compensation carbone sont des dons destinés à financer des 
                    projets environnementaux certifiés. Ces contributions sont volontaires et donnent 
                    droit à un reçu fiscal selon la législation applicable.
                  </p>
                  <p className="text-muted-foreground">
                    Amani Resorts s'engage à reverser 100% des contributions aux projets partenaires, 
                    déduction faite des frais de traitement.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Responsabilités</h2>
                  <p className="text-muted-foreground mb-4">
                    Amani Resorts s'engage à mettre en œuvre tous les moyens raisonnables pour assurer 
                    le bon fonctionnement de la Plateforme. Cependant, nous ne pouvons garantir :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>L'absence d'interruption ou d'erreur du service</li>
                    <li>La qualité des prestations fournies par les Partenaires</li>
                    <li>L'exactitude des informations fournies par les Partenaires</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    L'Utilisateur reste seul responsable de l'utilisation qu'il fait de la Plateforme 
                    et des informations qu'il y publie.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Propriété intellectuelle</h2>
                  <p className="text-muted-foreground">
                    L'ensemble des éléments de la Plateforme (textes, images, logos, code source, etc.) 
                    sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou 
                    utilisation non autorisée est interdite.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Données personnelles</h2>
                  <p className="text-muted-foreground">
                    Le traitement des données personnelles est régi par notre{" "}
                    <a href="/privacy" className="text-primary hover:underline">Politique de confidentialité</a>, 
                    qui fait partie intégrante des présentes CGU.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Modification des CGU</h2>
                  <p className="text-muted-foreground">
                    Amani Resorts se réserve le droit de modifier les présentes CGU à tout moment. 
                    Les modifications entrent en vigueur dès leur publication. L'utilisation 
                    continue de la Plateforme vaut acceptation des CGU modifiées.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">11. Droit applicable</h2>
                  <p className="text-muted-foreground">
                    Les présentes CGU sont régies par le droit comorien et, à titre subsidiaire, 
                    par le droit français. Tout litige sera soumis à la compétence exclusive des 
                    tribunaux de Moroni, sauf disposition légale contraire applicable aux consommateurs.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact</h2>
                  <p className="text-muted-foreground">
                    Pour toute question relative aux présentes CGU :<br />
                    Email : legal@amaniresorts.com<br />
                    Adresse : Avenue de la Corniche, Moroni, Comores
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
  );
};

export default TermsPage;
