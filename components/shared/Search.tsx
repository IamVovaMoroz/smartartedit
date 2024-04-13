"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

export const Search = () => {
	const router = useRouter();
	const searchParams = useSearchParams(); // Retrieves the search params from the URL query string.
	const [query, setQuery] = useState(""); // Initializes the state variable 'query' and its setter function.

	useEffect(() => {

		// Defines a useEffect hook that runs whenever 'router', 'searchParams', or 'query' changes.
		const delayDebounceFn = setTimeout(() => {
			// Sets a timeout to debounce the search input changes.
			if (query) {
				// Checks if the search query is not empty.
				const newUrl = formUrlQuery({
					searchParams: searchParams.toString(),
					key: "query",
					value: query,
				});
				// Forms a new URL with the updated search query.
				router.push(newUrl, { scroll: false });
			
			} else {
				const newUrl = removeKeysFromQuery({
					searchParams: searchParams.toString(),
					keysToRemove: ["query"],
				});
				// Pushes the new URL to the router without scrolling.
				router.push(newUrl, { scroll: false });
			}
		}, 300);

		return () => clearTimeout(delayDebounceFn);
		// Cleans up the timeout when the component unmounts or when 'router', 'searchParams', or 'query' changes.
	}, [router, searchParams, query]);

	return (
		// Renders the search component.
		<div className="search">
			<Image
				src="/assets/icons/search.svg"
				alt="search"
				width={24}
				height={24}
			/>
			{/* Renders an icon for search. */}

			<Input
				className="search-field"
				placeholder="Search"
				onChange={(e) => setQuery(e.target.value)}
			/>
			{/* Renders an input field for searching and updates the 'query' state on change. */}
		</div>
	);
};