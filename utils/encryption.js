const crypto = require("crypto");

// Environment variables
const env = require("../config/env");

const ENCRYPTION_KEY = Buffer.from(env.ENCRYPTION_KEY, "hex");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

exports.encrypt = (plainText) => {
  if (plainText == null) return null;

  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
};

exports.decrypt = (encryptedText) => {
  try {
    if (!encryptedText) return null;

    const data = Buffer.from(encryptedText, "base64");

    const iv = data.subarray(0, IV_LENGTH);

    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + 16);

    const encrypted = data.subarray(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString("utf8");
  } catch (error) {
    return null;
  }
};
