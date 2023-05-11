const express = require('express');
const app = express();

const postsJs = require('./posts')
const usersJs = require('./users')
const authJs = require('./auth')
const commentsJs = require('./comments')


module.exports = [postsJs, usersJs, authJs, commentsJs]
