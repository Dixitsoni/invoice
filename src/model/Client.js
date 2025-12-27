import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const clientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        company: {
            type: String,
            required: [true, "Company name is required"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
        },
        gstNumber: {
            type: String,
            default: "",
        },
        panNumber: {
            type: String,
            required: [true, "PAN number is required"],
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
        },
        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
