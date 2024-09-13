"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");
  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid nation ID");
  const updateData = { nationality, countryFlag, nationalID };
  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");
  revalidatePath("/account/profile");
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);
  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);
  if (error) throw new Error("Booking could not be deleted");
  revalidatePath("/account/reservations");
}

export async function siginInAction() {
  await signIn("github", { redirectTo: "/account" });
}
export async function siginOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateBooking(formData) {
  const reservationId = formData.get("reservationId");
  const numGuests = formData.get("numGuests");
  const observations = formData.get("observations");

  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);
  console.log(guestBookingIds, reservationId);
  if (!guestBookingIds.includes(+reservationId))
    throw new Error("You are not allowed to edit this booking");

  const { error } = await supabase
    .from("bookings")
    .update({ numGuests, observations })
    .eq("id", reservationId)
    .select()
    .single();
  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  revalidatePath(`/account/reservations/edit/${reservationId}`);
  revalidatePath(`/account/reservations`);

  redirect("/account/reservations");
}
export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");
  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabase
    .from("bookings")
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single();
  if (error) throw new Error("Booking could not be created");
  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}
