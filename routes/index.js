'use strict'

const express = require('express');
const api = express.Router();
const tokenController = require("../controllers/tokens")

api.post("/api/tokens/create", tokenController.createToken);
api.post("/api/tokens/info", tokenController.getTokenInfo);

module.exports = api
