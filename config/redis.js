const IORedis = require("ioredis");

// Environment Variables
const env = require("./env");

exports.redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

exports.getKey = async (key) => {
  return JSON.parse(await exports.redis.get(key));
};

exports.getTtl = async (key) => {
  return exports.redis.ttl(key);
};

exports.setKey = async (key, value, expiresIn) => {
  return expiresIn ? exports.redis.set(key, JSON.stringify(value), "EX", expiresIn) : exports.redis.set(key, JSON.stringify(value));
};

exports.deleteKey = async (key) => {
  return exports.redis.del(key);
};
