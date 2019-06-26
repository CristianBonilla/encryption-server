import path from 'path';
import express, { Express, Response, Request, NextFunction } from 'express';
import bearerToken from 'express-bearer-token';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import http from 'http';
import { logger } from '@/logger';
import nconf from 'nconf';
import getPort from 'get-port';
import helmet from 'helmet';

export type MessageHandler = (error: Error | null, success: string) => void;

export class Server {
  private readonly app: Express;

  constructor(private handler?: MessageHandler) {
    this.app = express();
    this.config();
  }

  public async start() {
    const port = nconf.get('PORT') || await getPort({
      port: 8080
    });
    const server = http.createServer(this.app);
    server.listen(port, () => {
      logger.info(`[SERVER] Listening on port ${ port }`);
      if (this.handler) {
        this.handler(null, `[SERVER] Server connected in: http://localhost:${ port }`);
      }
    });
  }

  public routes() {
  }

  private config() {
    this.app.use(bearerToken());
    this.app.use(cookieParser());
    this.app.use(morgan('common'));
    this.app.use(helmet());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json({ type: '*/*' }));
    this.publicDirectory();
  }

  private publicDirectory() {
    logger.info('[SERVER] Initializing public directory');
    const publicDirectory = path.resolve(__dirname, '../../../public');
    this.app.use(express.static(publicDirectory));

    // error handler
    this.app.use((error: any, request: Request, response: Response, next: NextFunction) => {
      response.status(error.status || 500);
      response.json({
        message: error.message,
        error: this.app.get('env') === 'development' ? error : { }
      });
      next(error);
    });
  }
}
