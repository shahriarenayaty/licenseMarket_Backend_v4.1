import http from "http";

// Define types for middleware and error handling
export type Middleware = (
  req: ShahriarIncomingMessage,
  res: http.ServerResponse<ShahriarIncomingMessage>,
  next: (err?: any) => void
) => void;
export type ErrorHandler = (
  err: any,
  req: ShahriarIncomingMessage,
  res: http.ServerResponse<ShahriarIncomingMessage>,
  next: (err?: any) => void
) => void;

export interface ShahriarIncomingMessage extends http.IncomingMessage {
  body?: any;
}
export class Router {
  private routes: { [key: string]: Middleware[] } = {};
  private middlewares: Middleware[] = [];
  private errorHandlers: ErrorHandler[] = [];

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  useError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
  }

  post(path: string, ...handlers: Middleware[]) {
    this.routes[`POST ${path}`] = handlers;
  }

  put(path: string, ...handlers: Middleware[]) {
    this.routes[`PUT ${path}`] = handlers;
  }

  delete(path: string, ...handlers: Middleware[]) {
    this.routes[`DELETE ${path}`] = handlers;
  }
  get(path: string, ...handlers: Middleware[]) {
    this.routes[`GET ${path}`] = handlers;
  }

  handle(
    req: ShahriarIncomingMessage,
    res: http.ServerResponse<ShahriarIncomingMessage>
  ) {
    const methodPath = `${req.method} ${req.url}`;
    const handlers = this.routes[methodPath] || [];
    const allHandlers = [...this.middlewares, ...handlers];

    let index = 0;
    const next = (err?: any) => {
      if (err) {
        return this.handleError(err, req, res);
      }
      if (index < allHandlers.length) {
        const handler = allHandlers[index++];
        handler(req, res, next);
      }
    };

    next();
  }

  private handleError(
    err: any,
    req: ShahriarIncomingMessage,
    res: http.ServerResponse<ShahriarIncomingMessage>
  ) {
    let index = 0;
    const next = (error?: any) => {
      if (index < this.errorHandlers.length) {
        const handler = this.errorHandlers[index++];
        handler(error || err, req, res, next);
      } else {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    };

    next();
  }
}
