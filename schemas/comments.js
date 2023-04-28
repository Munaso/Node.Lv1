const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },

  user: {
    type: String,
    required: true,
  }, 
  password: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },


});

commentsSchema.set('timestamps', true);
module.exports = mongoose.model("Comments", commentsSchema);