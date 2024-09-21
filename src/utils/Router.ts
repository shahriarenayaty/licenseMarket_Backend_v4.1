import http from "http";
import url from "url";

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
  params?: { [key: string]: string };
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

  private matchRoute(method: string, path: string) {
    for (const route in this.routes) {
      const [routeMethod, routePath] = route.split(" ");
      if (method === routeMethod) {
        const routeParts = routePath.split("/").filter(Boolean);
        const pathParts = path.split("/").filter(Boolean);

        if (routeParts.length === pathParts.length) {
          const params: { [key: string]: string } = {};
          let match = true;

          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(":")) {
              const paramName = routeParts[i].slice(1);
              params[paramName] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }

          if (match) {
            return { handlers: this.routes[route], params };
          }
        }
      }
    }
    return null;
  }

  handle(
    req: ShahriarIncomingMessage,
    res: http.ServerResponse<ShahriarIncomingMessage>
  ) {
    const parsedUrl = url.parse(req.url || "", true);
    const method = req.method || "GET";
    const path = parsedUrl.pathname || "";

    const routeMatch = this.matchRoute(method, path);
    if (!routeMatch) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    req.params = routeMatch.params;

    const handlers = routeMatch.handlers;
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
