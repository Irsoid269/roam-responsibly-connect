import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, HelpCircle, BookOpen, MessageCircle, Mail, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

type HelpFaqItem = { question: string; answer: string };
type PopularArticle = { title: string; category: string };

const HelpPage = () => {
  const { t } = useTranslation("help");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { icon: BookOpen, title: t("categories.bookings.title"), description: t("categories.bookings.description"), count: 12 },
    { icon: HelpCircle, title: t("categories.account.title"), description: t("categories.account.description"), count: 8 },
    { icon: MessageCircle, title: t("categories.community.title"), description: t("categories.community.description"), count: 6 },
  ];

  const popularArticles = t("popularArticles", { returnObjects: true }) as PopularArticle[];
  const faqs = t("faqs", { returnObjects: true }) as HelpFaqItem[];

  return (
    <main className="page-main">
        {/* Hero */}
        <section className="bg-gradient-to-b from-muted to-background py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t("subtitle")}
              </p>

              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer card-hover">
                    <CardContent className="pt-6">
                      <category.icon className="w-10 h-10 text-primary mb-4" />
                      <h3 className="font-semibold text-foreground mb-1">{category.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                      <p className="text-xs text-primary">{t("articlesCount", { count: category.count })}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              {t("popularArticlesTitle")}
            </h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {popularArticles.map((article, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{article.title}</p>
                        <p className="text-xs text-muted-foreground">{article.category}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              {t("faqTitle")}
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="text-center mt-8">
              <Link to="/faq">
                <Button variant="outline">
                  {t("viewAllFaq")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t("contact.title")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t("contact.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Card className="flex-1 max-w-xs">
                  <CardContent className="pt-6 text-center">
                    <Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">{t("contact.emailTitle")}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t("contact.emailResponse")}</p>
                    <a href="mailto:support@amaniresorts.com" className="text-primary hover:underline">
                      support@amaniresorts.com
                    </a>
                  </CardContent>
                </Card>

                <Card className="flex-1 max-w-xs">
                  <CardContent className="pt-6 text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">{t("contact.chatTitle")}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t("contact.chatHours")}</p>
                    <Button size="sm">
                      {t("contact.startChat")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
  );
};

export default HelpPage;
