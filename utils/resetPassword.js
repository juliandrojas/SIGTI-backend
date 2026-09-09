import crypto from "crypto";

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const getResetTokenExpiry = (minutes = 15) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};