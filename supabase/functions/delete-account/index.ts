// RGPD — droit à l'effacement (cahier §7.1/§9) : suppression du compte de
// l'utilisateur authentifié, et seulement le sien (aucun paramètre de cible,
// pour empêcher toute élévation de privilège).
//
// Le schéma gère déjà la tension effacement-des-données-personnelles vs.
// obligation légale de conservation comptable : payments/invoices/refunds/
// donations référencent l'utilisateur en ON DELETE SET NULL (l'historique
// financier survit, anonymisé), alors que reservations est en ON DELETE
// CASCADE (les réservations de l'utilisateur disparaissent avec lui). La
// suppression de l'utilisateur Supabase Auth déclenche ces cascades
// automatiquement — cette fonction ne fait qu'exposer un point d'entrée
// self-service sécurisé à `auth.admin.deleteUser`, qui n'est utilisable
// qu'avec la service_role key (jamais côté client).
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "missing_authorization" }, 401);

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !userData.user) return jsonResponse({ error: "unauthenticated" }, 401);
    const userId = userData.user.id;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Trace de l'effacement avant suppression (l'audit_log ne peut plus
    // référencer cet utilisateur une fois supprimé).
    await supabaseAdmin.from("audit_log").insert({
      actor_id: userId,
      actor_type: "user",
      entity_type: "account",
      entity_id: userId,
      action: "self_delete",
      payload: { email: userData.user.email },
    });

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return jsonResponse({ deleted: true });
  } catch (error) {
    console.error("delete-account error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "unknown_error" },
      500,
    );
  }
});
