import crypto from "crypto";

const resetTokenHash = crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex");
const expiresAt = new Date(Date.now() + 15 * 60 * 1000);