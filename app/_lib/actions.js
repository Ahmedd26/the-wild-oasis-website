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

    if (!/^[a-zA-Z0-9]{6,14}$/.test(nationalID))
        throw new Error("Please provide a valid national ID");

    const updateData = {
        nationalID,
        nationality,
        countryFlag,
    };

    const { data, error } = await supabase
        .from("guests")
        .update(updateData)
        .eq("id", session.user.guestId);

    if (error) throw new Error("Guest could not be updated");
    // manually revalidate the browser cache to prevent stale data.
    revalidatePath("/account/profile");
}

export async function createBooking(bookingData, formData) {
    // Authentication
    const session = await auth();
    if (!session) throw new Error("You must be logged in");

    // Obj.entries(formData.entries)
    const newBooking = {
        ...bookingData,
        guestId: session.user.guestId,
        numGuests: Number(formData.get("numGuests")),
        observations: formData.get("observations").slice(0, 1000),
        extrasPrice: 0,
        totalPrice: bookingData.cabinPrice,
        status: "unconfirmed",
        hasBreakfast: false,
        isPaid: false,
    };

    const { error } = await supabase.from("bookings").insert([newBooking]);

    if (error) throw new Error("Booking could not be created");

    revalidatePath(`/cabins/${bookingData.cabinId}`);
    redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
    const session = await auth();
    if (!session) throw new Error("You must be logged in");

    // Verify its the user own reservation.
    const guestBookings = await getBookings(session.user.guestId);
    const guestBookingIds = guestBookings.map((booking) => booking.id);

    if (!guestBookingIds.includes(bookingId))
        throw new Error("You're not allowed to delete this booking.");

    const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

    if (error) throw new Error("Booking could not be deleted");
    // manually revalidate the browser cache to prevent stale data.
    revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
    const bookingId = Number(formData.get("bookingId"));
    // Authentication
    const session = await auth();
    if (!session) throw new Error("You must be logged in");

    // Authorization
    // Verify its the user own reservation.
    const guestBookings = await getBookings(session.user.guestId);
    const guestBookingIds = guestBookings.map((booking) => booking.id);

    if (!guestBookingIds.includes(bookingId))
        throw new Error("You're not allowed to modify this booking.");

    // Building Update data
    const updateData = {
        numGuests: Number(formData.get("numGuests")),
        observations: formData.get("observations").slice(0, 1000),
    };

    // Update logic (Mutation)
    const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", bookingId);
    // Error handling
    if (error) throw new Error("Booking could not be updated");
    // Revalidating cache
    revalidatePath("/account/reservations");
    revalidatePath(`/account/reservations/edit/${bookingId}`);
    // Redirection
    redirect("/account/reservations");
}

export async function signInAction() {
    await signIn("google", { redirectTo: "/account" });
}
export async function signOutAction() {
    await signOut({ redirectTo: "/" });
}
