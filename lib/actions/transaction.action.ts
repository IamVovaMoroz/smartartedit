"use server";

import { redirect } from 'next/navigation'
import Stripe from "stripe";
import { handleError } from '../utils';
import { connectToDatabase } from '../database/mongoose';
import Transaction from '../database/models/transaction.model';
import { updateCredits } from './user.actions';

// Function to initiate the checkout process for purchasing credits
export async function checkoutCredits(transaction: CheckoutTransactionParams) {
	// Initialize Stripe with the secret key
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
	// Convert the amount to cents as required by Stripe
	const amount = Number(transaction.amount) * 100;
	// Create a Stripe checkout session
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: 'usd',
					unit_amount: amount,
					product_data: {
						name: transaction.plan,
					}
				},
				quantity: 1
			}
		],
		metadata: {
			plan: transaction.plan,
			credits: transaction.credits,
			buyerId: transaction.buyerId,
		},
		mode: 'payment',
		success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`, // Redirect URL on successful payment
		cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`, // Redirect URL on payment cancellation
	})
	// Redirect the user to the checkout session URL
	redirect(session.url!)
}

// Function to create a new transaction in the database
export async function createTransaction(transaction: CreateTransactionParams) {
	try {
		// Connect to the database
		await connectToDatabase();

		// Create a new transaction with a buyerId
		const newTransaction = await Transaction.create({
			...transaction, buyer: transaction.buyerId
		})
		// Update the user's credits after the transaction
		await updateCredits(transaction.buyerId, transaction.credits);
		// Return the newly created transaction as JSON
		return JSON.parse(JSON.stringify(newTransaction));
	} catch (error) {
		// Handle any errors that occur during transaction creation
		handleError(error)
	}
}