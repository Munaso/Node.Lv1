const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  commentId:{
    type: Number,
    required: true,
  },  
  postId: {
    type: Number,
    required: true,
  },
  userId: {
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