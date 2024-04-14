"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";

import { useToast } from "@/components/ui/use-toast";
import { checkoutCredits } from "@/lib/actions/transaction.action";

import { Button } from "../ui/button";

const Checkout = ({
	plan,
	amount,
	credits,
	buyerId,
}: {
	plan: string;
	amount: number;
	credits: number;
	buyerId: string;
}) => {
	const { toast } = useToast(); // Destructuring toast function from useToast hook

	useEffect(() => {
		loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!); // Loading Stripe instance when component mounts
	}, []);  // Running this effect only once on component mount

	useEffect(() => {

		// Checking for query parameters indicating success or cancellation of order
		const query = new URLSearchParams(window.location.search);
		// Showing success toast if order is successful
		if (query.get("success")) {
			toast({
				title: "Order placed!",
				description: "You will receive an email confirmation",
				duration: 5000,
				className: "success-toast",
			});
		}

		if (query.get("canceled")) {
			// Showing error toast if order is canceled
			toast({
				title: "Order canceled!",
				description: "Continue to shop around and checkout when you're ready",
				duration: 5000,
				className: "error-toast",
			});
		}
	}, []);

	const onCheckout = async () => {
		const transaction = {
			plan, // Plan for the transaction
			amount, // Amount for the transaction
			credits, // Credits for the transaction
			buyerId, // Buyer ID for the transaction
		};

		await checkoutCredits(transaction); // Calling checkoutCredits function to process the transaction
	};

	return (
		<form action={onCheckout} method="POST">
			<section>
				<Button
					type="submit"
					role="link"
					className="w-full rounded-full bg-purple-gradient bg-cover"
				>
					Buy Credit
				</Button>
			</section>
		</form>
	);
};

export default Checkout;
