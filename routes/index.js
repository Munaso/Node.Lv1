const express = require('express');
const app = express();

const posts = require('./posts')
const users = require('./users')
const auth = require('./auth')
const comments = require('./comments')
const likes = require('./likes')



module.exports = [posts, users, auth, comments, likes]
