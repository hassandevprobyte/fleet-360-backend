const jwksClient = require("jwks-rsa");

// Configs
const { env } = require("../config");

const jwks = jwksClient({
  jwksUri: `${env.AUTH_360_API_URL}/public/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

const getSigningKey = (header, callback) => {
  if (!header?.kid) {
    return callback(new Error("JWT signing key ID is missing"));
  }

  jwks.getSigningKey(header.kid, (error, key) => {
    if (error) {
      return callback(error);
    }

    callback(null, key.getPublicKey());
  });
};

module.exports = getSigningKey;
