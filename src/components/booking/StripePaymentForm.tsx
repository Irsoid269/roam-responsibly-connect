import { useEffect, useState, type FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  reservationId?: string | null;
  holdIds?: string[];
  onSuccess: () => void;
  onError?: (message: string) => void;
}

function CheckoutForm({
  onSuccess,
  onError,
}: Pick<StripePaymentFormProps, "onSuccess" | "onError">) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      onError?.(error.message || "Le paiement a échoué.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess();
    } else {
      onError?.("Le paiement nécessite une confirmation supplémentaire.");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" className="w-full" size="lg" disabled={!stripe || submitting}>
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Paiement en cours…
          </>
        ) : (
          "Payer maintenant"
        )}
      </Button>
    </form>
  );
}

/** Requests a PaymentIntent from the create-payment-intent Edge Function, then
 * renders Stripe's own payment form once the client secret is ready. */
const StripePaymentForm = ({
  amount,
  currency = "eur",
  reservationId,
  holdIds,
  onSuccess,
  onError,
}: StripePaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-payment-intent",
        { body: { amount, currency, reservationId, holdIds, idempotencyKey } },
      );
      if (cancelled) return;
      if (fnError || !data?.clientSecret) {
        const message = fnError?.message || "Impossible d'initialiser le paiement.";
        setError(message);
        onError?.(message);
        return;
      }
      setClientSecret(data.clientSecret);
    })();
    return () => {
      cancelled = true;
    };
    // Re-running on every keystroke elsewhere would spawn duplicate PaymentIntents;
    // only the values that should ever change a checkout amount are watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, currency, reservationId, idempotencyKey]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Préparation du paiement…
      </div>
    );
  }

  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
};

export default StripePaymentForm;
