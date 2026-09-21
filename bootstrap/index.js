const { connectDB } = require("../config");

const bootstrap = async () => {
  await connectDB();

  console.log("App bootstrapped successfully".bgGreen.white);
};

module.exports = bootstrap;
