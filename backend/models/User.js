import { Schema, model } from "mongoose";
import { hash, compare } from "bcryptjs";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    password: { type: String, required: true, minlength: 6 },

    avatar: { type: String, default: "" },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    targetCompanies: [{ type: String }],
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await hash(this.password, 12);
});

// 🔹 Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return compare(candidatePassword, this.password);
};

export default model("User", userSchema);