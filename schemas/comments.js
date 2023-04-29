const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
  },

  commentId:{
    type: Number,
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