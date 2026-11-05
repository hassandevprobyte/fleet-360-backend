const crypto = require("crypto");

exports.generateWorkspaceSlug = (length = 10) => {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
};
