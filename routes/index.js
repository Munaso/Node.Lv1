const express = require('express');
const app = express();

const postsJs = require('./posts')
const commentsJs = require('./comments')
const usersJs = require('./users')
const authJs = require('./auth')




module.exports = [postsJs, commentsJs, usersJs, authJs]
