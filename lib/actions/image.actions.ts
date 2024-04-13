"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

import { v2 as cloudinary } from 'cloudinary'

const populateUser = (query: any) => query.populate({
	path: 'author',
	model: User,
	select: '_id firstName lastName clerkId'
})

// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
	try {
		await connectToDatabase(); // Connects to the database.

		const author = await User.findById(userId); // Finds the user by ID.

		if (!author) {
			throw new Error("User not found"); // Throws an error if user is not found.
		}

		const newImage = await Image.create({
			...image,
			author: author._id,
		}) // Creates a new image.

		revalidatePath(path); // Revalidates the specified path.

		return JSON.parse(JSON.stringify(newImage)); // Returns the new image data.
	} catch (error) {
		handleError(error) // Handles errors.
	}
}


// UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
	try {
		await connectToDatabase();

		const imageToUpdate = await Image.findById(image._id); // Finds the image by ID.

		if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
			throw new Error("Unauthorized or image not found"); // Throws an error if the user is unauthorized or image is not found.
		}

		const updatedImage = await Image.findByIdAndUpdate(
			imageToUpdate._id,
			image,
			{ new: true }
		) // Updates the image.

		revalidatePath(path); // Revalidates the specified path.

		return JSON.parse(JSON.stringify(updatedImage)); // Returns the updated image data.
	} catch (error) {
		handleError(error) // Handles errors.
	}
}

// DELETE IMAGE
export async function deleteImage(imageId: string) {
	try {
		await connectToDatabase();

		await Image.findByIdAndDelete(imageId); // Deletes the image by ID.
	} catch (error) {
		handleError(error) // Handles errors.
	} finally {
		redirect('/') // Redirects to the home page.
	}
}

// GET IMAGE
export async function getImageById(imageId: string) {
	try {
		await connectToDatabase();

		const image = await populateUser(Image.findById(imageId)); // Finds the image by ID and populates the author information.

		if (!image) throw new Error("Image not found"); // Throws an error if image is not found.

		return JSON.parse(JSON.stringify(image)); // Returns the image data.
	} catch (error) {
		handleError(error) // Handles errors.
	}
}

// GET IMAGES
export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
	limit?: number;
	page: number;
	searchQuery?: string;
}) {
	try {
		await connectToDatabase(); // Connects to the database.

		cloudinary.config({
			cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
			secure: true,
		}) // Configures the Cloudinary API.

		let expression = 'folder=smartartedit';

		if (searchQuery) {
			expression += ` AND ${searchQuery}`
		} // Constructs the search expression for Cloudinary.

		const { resources } = await cloudinary.search
			.expression(expression)
			.execute(); // Executes the Cloudinary search.

		const resourceIds = resources.map((resource: any) => resource.public_id); // Extracts the public IDs of the resources.

		let query = {};

		if (searchQuery) {
			query = {
				publicId: {
					$in: resourceIds
				}
			}
		} // Constructs the query for MongoDB.

		const skipAmount = (Number(page) - 1) * limit; // Calculates the skip amount for pagination.

		const images = await populateUser(Image.find(query))
			.sort({ updatedAt: -1 })
			.skip(skipAmount)
			.limit(limit); // Retrieves images from the database.

		const totalImages = await Image.find(query).countDocuments(); // Calculates the total number of images.
		const savedImages = await Image.find().countDocuments(); // Calculates the total number of saved images.

		return {
			data: JSON.parse(JSON.stringify(images)), // Returns the image data.
			totalPage: Math.ceil(totalImages / limit), // Calculates the total number of pages.
			savedImages,
		}
	} catch (error) {
		handleError(error) // Handles errors.
	}
}
// GET IMAGES BY USER
export async function getUserImages({
	limit = 9,
	page = 1,
	userId,
}: {
	limit?: number;
	page: number;
	userId: string;
}) {
	try {
		await connectToDatabase(); // Connects to the database.

		const skipAmount = (Number(page) - 1) * limit; // Calculates the skip amount for pagination.

		const images = await populateUser(Image.find({ author: userId })) // Retrieves images by user ID.
			.sort({ updatedAt: -1 }) // Sorts the images by updatedAt field in descending order.
			.skip(skipAmount) // Skips images according to pagination.
			.limit(limit); // Limits the number of images per page.

		const totalImages = await Image.find({ author: userId }).countDocuments(); // Counts the total number of images by user.

		return {
			data: JSON.parse(JSON.stringify(images)), // Returns the image data.
			totalPages: Math.ceil(totalImages / limit), // Calculates the total number of pages.
		};
	} catch (error) {
		handleError(error); // Handles errors.
	}
}