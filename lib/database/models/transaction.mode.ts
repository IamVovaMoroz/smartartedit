import { Document, Schema, model, models, Types } from 'mongoose';
import { IUser } from './user.model'; // Предполагая, что вы уже определили интерфейс IUser


export interface ITransaction extends Document {
	createdAt: Date;
	stripeId: string;
	amount: number;
	plan?: string;
	credits?: number;
	buyer: Types.ObjectId | IUser;
}


const TransactionSchema = new Schema<ITransaction>({
	createdAt: {
		type: Date,
		default: Date.now,
	},
	stripeId: {
		type: String,
		required: true,
		unique: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	plan: {
		type: String,
	},
	credits: {
		type: Number,
	},
	buyer: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
});


const Transaction = models?.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
