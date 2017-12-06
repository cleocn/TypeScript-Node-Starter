import * as bcrypt from "bcrypt-nodejs";
import * as crypto from "crypto";
import * as mongoose from "mongoose";

export type RecommendedModel = mongoose.Document & {
  title: string,
  images: string[],
  description: string,
  isDeleted: boolean,

  userId: string
};


const recommendedSchema = new mongoose.Schema({
  title: String,
  images: [{url: String, name: String}],
  description: String,
  isDeleted: Boolean,

  userId: String
}, {  timestamps: true });

/**
 * Password hash middleware.
 */
recommendedSchema.pre("save", function save(next) {
  next();
});

// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const Recommended = mongoose.model("Recommended", recommendedSchema);
export default Recommended;