import { Router } from 'express';
import { DocumentRoute } from '@routes/document-route';

export class IndexRoute {
  private readonly routerInstance: Router;

  public get router() {
    return this.routerInstance;
  }

  constructor() {
    this.routerInstance = Router();
    this.routes();
  }

  private routes() {
    const route = this.router.route('/');
    route.get((request, response, next) => {
      response.status(200).send({
        message: '[API] Connected...'
      });
    });
    const documentRoute = new DocumentRoute(this.router);
    documentRoute.routes();

    return route;
  }
}
