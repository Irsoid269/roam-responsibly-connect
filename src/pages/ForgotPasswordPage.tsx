import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import amaniSymbol from "@/assets/amani-symbol-gold.jpg";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Email envoyé si ce compte existe");
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

        <h1 className="font-display text-3xl font-medium mb-2">Mot de passe oublié</h1>
        <p className="text-muted-foreground mb-8">
          Entrez votre email : nous vous enverrons un lien de réinitialisation.
        </p>

        {sent ? (
          <div className="rounded-xl border bg-muted/40 p-6 space-y-4">
            <p className="text-sm leading-relaxed">
              Vérifiez votre boîte mail ({email}). Le lien expire après quelques minutes.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? "Envoi…" : "Envoyer le lien"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
