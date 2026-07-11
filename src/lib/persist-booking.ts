import { supabase } from "@/integrations/supabase/client";
import type { BookingConfirmationData, BookingLineItem } from "@/components/branding/BookingConfirmation";

export interface PersistBookingInput {
  userId: string;
  destinationId?: string | null;
  checkIn: string;
  checkOut: string;
  items: Array<{
    id: string;
    type: string;
    name: string;
    price: number;
    quantity: number;
    carbonImpact: number;
  }>;
  guestName: string;
  guestEmail: string;
  destinationLabel?: string;
}

export interface PersistBookingResult {
  reservationId: string;
  confirmation: BookingConfirmationData;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string | null | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

/** Persiste réservation + lignes + empreinte carbone, retourne données de confirmation. */
export async function persistBooking(
  input: PersistBookingInput,
): Promise<PersistBookingResult> {
  if (!input.userId) {
    throw new Error("Utilisateur non authentifié");
  }
  if (!input.items.length) {
    throw new Error("Aucun service à réserver");
  }
  if (!input.checkIn || !input.checkOut) {
    throw new Error("Dates de séjour manquantes");
  }

  const checkIn = input.checkIn;
  const checkOut = input.checkOut;

  const subtotal = input.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Math.max(1, Number(item.quantity || 1)),
    0,
  );
  const totalCarbon = input.items.reduce(
    (sum, item) =>
      sum + Number(item.carbonImpact || 0) * Math.max(1, Number(item.quantity || 1)),
    0,
  );
  const carbonOffset = Number((totalCarbon * 2).toFixed(2));
  const total = Number((subtotal + carbonOffset).toFixed(2));

  let destinationId: string | null = isUuid(input.destinationId)
    ? input.destinationId
    : null;

  // Verify destination exists to avoid FK failure
  if (destinationId) {
    const { data: dest } = await supabase
      .from("destinations")
      .select("id")
      .eq("id", destinationId)
      .maybeSingle();
    if (!dest) destinationId = null;
  }

  const insertReservation = async (destId: string | null) =>
    supabase
      .from("reservations")
      .insert({
        user_id: input.userId,
        destination_id: destId,
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_price: total,
        total_carbon_impact: totalCarbon,
        carbon_offset_purchased: carbonOffset > 0,
        status: "confirmed",
      })
      .select("id")
      .single();

  let { data: reservation, error: reservationError } =
    await insertReservation(destinationId);

  // Retry without destination if FK constraint fails
  if (reservationError && destinationId) {
    const retry = await insertReservation(null);
    reservation = retry.data;
    reservationError = retry.error;
  }

  if (reservationError || !reservation) {
    throw new Error(
      reservationError?.message ||
        "Impossible de créer la réservation (droits ou connexion)",
    );
  }

  const lineItems = input.items.map((item) => {
    const qty = Math.max(1, Number(item.quantity || 1));
    const unit = Number(item.price || 0);
    return {
      reservation_id: reservation.id,
      item_id: isUuid(item.id) ? item.id : reservation.id,
      item_type: item.type,
      item_name: item.name,
      quantity: qty,
      unit_price: unit,
      total_price: unit * qty,
      carbon_impact: Number(item.carbonImpact || 0) * qty,
      start_date: checkIn,
      end_date: checkOut,
    };
  });

  const { error: itemsError } = await supabase
    .from("reservation_items")
    .insert(lineItems);

  if (itemsError) {
    // Rollback reservation if items failed
    await supabase.from("reservations").delete().eq("id", reservation.id);
    throw new Error(itemsError.message || "Impossible d'enregistrer les services");
  }

  const byType = (type: string) =>
    input.items
      .filter((i) => i.type === type)
      .reduce(
        (sum, i) =>
          sum + Number(i.carbonImpact || 0) * Math.max(1, Number(i.quantity || 1)),
        0,
      );

  const { error: carbonError } = await supabase.from("carbon_footprint_history").insert({
    user_id: input.userId,
    reservation_id: reservation.id,
    transport_carbon: byType("mobility"),
    accommodation_carbon: byType("accommodation"),
    activities_carbon: byType("activity") + byType("coworking"),
    total_carbon: totalCarbon,
    offset_amount: carbonOffset,
    date: checkIn,
  });

  if (carbonError) {
    console.warn("carbon_footprint_history insert failed:", carbonError.message);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, trips_count, total_carbon_saved")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (profile) {
    await supabase
      .from("profiles")
      .update({
        trips_count: (profile.trips_count || 0) + 1,
        total_carbon_saved:
          Number(profile.total_carbon_saved || 0) + carbonOffset,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
  }

  const reference = `AMN-${reservation.id.slice(0, 8).toUpperCase()}`;
  const confirmationItems: BookingLineItem[] = input.items.map((item) => ({
    name: item.name,
    type: item.type,
    quantity: Math.max(1, Number(item.quantity || 1)),
    unitPrice: Number(item.price || 0),
    carbonImpact: Number(item.carbonImpact || 0),
  }));

  return {
    reservationId: reservation.id,
    confirmation: {
      reference,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      checkIn,
      checkOut,
      destination: input.destinationLabel || "Comores",
      items: confirmationItems,
      subtotal,
      carbonOffset,
      total,
      totalCarbon,
    },
  };
}
