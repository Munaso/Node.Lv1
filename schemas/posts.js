const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
  }, 
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true, 
  },
  content: {
    type: String,
    required: true,
  },
});

postsSchema.set('timestamps', true);
module.exports = mongoose.model("Posts", postsSchema);