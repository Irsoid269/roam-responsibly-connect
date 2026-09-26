import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const TermsPage = () => {
  const { t } = useTranslation("terms");
  return (
    <main className="page-main">
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {t("title")}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t("lastUpdate")}
              </p>

              <div className="prose dark:prose-invert max-w-none space-y-8 prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-accent">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.purpose.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.purpose.body")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.definitions.title")}</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    {(t("sections.definitions.items", { returnObjects: true }) as { label: string; text: string }[]).map((item, i) => (
                      <li key={i}><strong>{item.label}</strong> {item.text}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.access.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.access.body1")}
                  </p>
                  <p className="text-muted-foreground">
                    {t("sections.access.body2")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.services.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.services.intro")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    {(t("sections.services.items", { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.bookings.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.bookings.body1")}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.bookings.body2")}
                  </p>
                  <p className="text-muted-foreground">
                    {t("sections.bookings.body3")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.carbon.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.carbon.body1")}
                  </p>
                  <p className="text-muted-foreground">
                    {t("sections.carbon.body2")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.liability.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.liability.intro")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    {(t("sections.liability.items", { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    {t("sections.liability.outro")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.ip.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("sections.ip.body")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.personalData.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("sections.personalData.body1")}{" "}
                    <a href="/privacy" className="text-primary hover:underline">{t("sections.personalData.link")}</a>,{" "}
                    {t("sections.personalData.body2")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.changes.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("sections.changes.body")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.law.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("sections.law.body")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.contact.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("sections.contact.intro")}<br />
                    Email : legal@amaniresorts.com<br />
                    {t("sections.contact.address")}
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
