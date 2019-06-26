import { Server, MessageHandler } from '@/config/initializer/server';
import nconf from 'nconf';
import async from 'async';
import { logger } from '@/logger';
import dotenv from 'dotenv';

dotenv.config();
nconf.use('memory');
nconf.argv();
nconf.env();

// console.log(nconf.get('NODE_ENV'));
// import(`@/config/environment/${ nconf.get('NODE_ENV') }`);
logger.info('[APP] Starting server initilization');

// Initialization modules
async.series([
  (startServer: MessageHandler) => {
    const server = new Server(startServer);
    server.start();
  }
], (error, successArray) => {
  if (error) {
    logger.error(`[APP] initialization failed:\n${ error.message }`);
  } else {
    logger.info('[APP] initialized SUCCESSFULLY');
    if (successArray) {
      successArray.filter(success => typeof success === 'string')
        .forEach(success => logger.verbose(success as string));
    }
  }
});
