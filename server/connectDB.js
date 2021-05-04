const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = mongoose.connect(process.env.MONGOURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
