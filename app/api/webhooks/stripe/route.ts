/* eslint-disable camelcase */
import { createTransaction } from "@/lib/actions/transaction.action";
import { NextResponse } from "next/server";
import stripe from "stripe";

export async function POST(request: Request) {
	// Parse the request body
	const body = await request.text();
	// Get the Stripe signature from request headers
	const sig = request.headers.get("stripe-signature") as string;
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

	let event;

	try {
		// Construct the Stripe webhook event
		event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
	} catch (err) {
		// Handle webhook error
		return NextResponse.json({ message: "Webhook error", error: err });
	}

	// Get the ID and type
	const eventType = event.type;
	// Handle different types of events
	// CREATE
	if (eventType === "checkout.session.completed") {
		// Extract relevant data from the event
		const { id, amount_total, metadata } = event.data.object;
		// Create a transaction object
		const transaction = {
			stripeId: id,
			amount: amount_total ? amount_total / 100 : 0, // Convert amount to dollars
			plan: metadata?.plan || "", // Get plan from metadata, default to empty string
			credits: Number(metadata?.credits) || 0, // Parse credits from metadata, default to 0
			buyerId: metadata?.buyerId || "", // Get buyer ID from metadata, default to empty string
			createdAt: new Date(), // Set current date and time as creation date
		};
		// Create a new transaction in the database
		const newTransaction = await createTransaction(transaction);
		// Return success response with the new transaction data
		return NextResponse.json({ message: "OK", transaction: newTransaction });
	}
	// Return empty response with status 200 for other types of events
	return new Response("", { status: 200 });
}