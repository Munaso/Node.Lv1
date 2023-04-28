const express = require('express');
const app = express();

const postsJs = require('./posts.js')
const commentsJs = require('./comments.js')


module.exports = [postsJs, commentsJs]
