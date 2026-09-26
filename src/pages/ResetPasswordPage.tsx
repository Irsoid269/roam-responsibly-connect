import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import amaniSymbol from "@/assets/amani-symbol-gold.jpg";

const ResetPasswordPage = () => {
  const { t } = useTranslation("authPages");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Recovery link sets session via hash; wait briefly for auth state
    const timer = setTimeout(() => setReady(true), 400);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error(t("resetPassword.minLength"));
      return;
    }
    if (password !== confirm) {
      toast.error(t("resetPassword.mismatch"));
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("resetPassword.updated"));
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-3 mb-8">
          <img src={amaniSymbol} alt="Amani" className="w-10 h-10 rounded-full object-cover" />
          <span className="font-display text-2xl font-medium">
            AMANI<span className="text-accent"> Resorts</span>
          </span>
        </Link>

        <h1 className="font-display text-3xl font-medium mb-2">{t("resetPassword.title")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("resetPassword.subtitle")}
        </p>

        {!ready ? (
          <p className="text-sm text-muted-foreground">{t("resetPassword.checkingLink")}</p>
        ) : !session ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("resetPassword.invalidLink")}
            </p>
            <Button asChild>
              <Link to="/forgot-password">{t("resetPassword.requestLink")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">{t("resetPassword.newPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("resetPassword.confirm")}</Label>
              <Input
                id="confirm"
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? t("resetPassword.saving") : t("resetPassword.save")}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
