
import { Document } from 'mongoose';
import { Schema, model, models } from 'mongoose';

export interface IImag extends Document {
	title: string;
	transformationType: string;
	publicId: string;
	secureUrl: string;
	width?: number;
	height?: number;
	config?: object;
	transformationUrl?: string;
	aspectRatio?: string;
	color?: string;
	prompt?: string;
	author: { _id: string; firstName: string; lastName: string; } // Assuming Schema.Types.ObjectId will be represented as string
	createdAt?: Date;
	updatedAt?: Date;
}



const ImageSchema = new Schema({
	title: { type: String, requred: true },
	transformationTYpe: { type: String, requred: true },
	publicId: { type: String, requred: true },
	secureUrl: { type: URL, required: true },
	width: { type: Number },
	height: { type: Number },
	config: { type: Object },
	transformationUrl: { type: URL },
	aspectRatio: { type: String },
	color: { type: String },
	prompt: { type: String },
	author: { type: Schema.Types.ObjectId, ref: 'User' },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }

})

const Image = models?.Image || model('Image', ImageSchema);

export default Image;