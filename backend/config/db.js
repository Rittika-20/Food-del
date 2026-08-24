// import mongoose from "mongoose";

// export const connectDB = async () => {
//     await mongoose.connect('mongodb+srv://rittika27basak_db_user:VcZnmBdKdzL0KfR0@cluster0.lqlmust.mongodb.net/food-delivery').then(() => console.log("DB Connected"));
// }

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI).then(() => console.log("DB Connected"));
}