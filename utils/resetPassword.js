import crypto from "crypto";

export const createResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  return { token, tokenHash, expiresAt };
};

export const hashResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};