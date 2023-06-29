'use strict'

const express = require('express');
const app = express();
const api = require('./routes');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(api);

module.exports = app
