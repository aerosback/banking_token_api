require('dotenv').config()
const logger = require("./utils/logger")
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

const url = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`

logger.debug(`connection url:${url}`)

module.exports = {
  port: process.env.NODE_DOCKER_PORT || 8000,
  db_connection: url
}
