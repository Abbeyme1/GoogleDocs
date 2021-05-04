const Mongoose = require("mongoose");

const Document = Mongoose.Schema({
  _id: String,
  data: Object,
});

module.exports = Mongoose.model("Document", Document);
