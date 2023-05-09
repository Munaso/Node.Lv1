const express = require('express');
const app = express();

const postsJs = require('./posts')
const usersJs = require('./users')
const authJs = require('./auth')

module.exports = [postsJs, usersJs, authJs]
