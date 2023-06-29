'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');


const connectDB = async () => {
  try{
    await mongoose.connect(config.db_connection);
    logger.debug(`Mongoose Connection Succesfully: ${config.db_connection}.`)
  }
  catch(err){
    logger.error(`Mongoose Connection Error occurred: ${err}.`)
  }
}

connectDB()

app.listen(config.port, () => {
  console.log('API REST running on localhost:' + config.port);
});
