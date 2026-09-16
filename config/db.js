const mongoose = require("mongoose");

// Environment variables
const env = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`Connected to database ${conn.connection.host}`.bgGreen.white);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
