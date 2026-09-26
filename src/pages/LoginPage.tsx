import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import amaniSymbol from "@/assets/amani-symbol-gold.jpg";

const LoginPage = () => {
  const { t } = useTranslation("authPages");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "magicLink">("password");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { signIn, signInWithMagicLink } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "magicLink") {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        toast({
          title: t("login.error"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        setMagicLinkSent(true);
      }
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: t("login.loginError"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("login.welcomeTitle"),
        description: t("login.welcomeDescription"),
      });
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-3 mb-8 group">
            <img
              src={amaniSymbol}
              alt="Amani Resorts"
              className="w-11 h-11 rounded-full object-cover transition-transform group-hover:scale-105"
            />
            <span className="font-display text-2xl font-medium text-foreground leading-none">
              AMANI<span className="text-accent"> Resorts</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-2">
            {t("login.title")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t("login.subtitle")}
          </p>

          {magicLinkSent ? (
            <div className="rounded-lg border border-border bg-muted/40 p-5 text-center space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-accent" />
              <p className="font-medium text-foreground">{t("login.linkSent")}</p>
              <p className="text-sm text-muted-foreground">
                {t("login.linkSentDescription", { email })}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMagicLinkSent(false);
                  setMode("password");
                }}
              >
                {t("login.back")}
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("login.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {mode === "password" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("login.password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "password" && (
                  <div className="flex items-center justify-between">
                    <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                      {t("login.forgotPassword")}
                    </Link>
                  </div>
                )}

                <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                  {loading
                    ? t("login.loggingIn")
                    : mode === "magicLink"
                      ? t("login.sendLink")
                      : t("login.submit")}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setMode(mode === "password" ? "magicLink" : "password")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 underline underline-offset-2"
              >
                {mode === "password"
                  ? t("login.useMagicLink")
                  : t("login.usePassword")}
              </button>

              <p className="text-center text-muted-foreground mt-6">
                {t("login.noAccount")}{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  {t("login.createAccount")}
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-glow" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img
                src={amaniSymbol}
                alt=""
                className="w-20 h-20 mx-auto mb-6 rounded-full object-cover ring-2 ring-accent/50"
              />
              <h2 className="font-display text-3xl font-medium mb-4">
                {t("login.sideTitle")}
              </h2>
              <p className="text-lg text-primary-foreground/85 max-w-md mx-auto">
                {t("login.sideDescription")}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
