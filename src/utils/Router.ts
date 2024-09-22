import http from "http";
import url from "url";
import { RouteTrie } from "./Route";
import MyErrorHandler, { sendError } from "./MyErrorHandler";

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
  query?: { [key: string]: string | string[] };
}
export class Router {
  private trie = new RouteTrie();
  private middlewares: Middleware[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private subRouters: { [key: string]: Router } = {};

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  useError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
  }

  post(path: string, ...handlers: Middleware[]) {
    this.trie.insert("POST", path, handlers);
  }

  put(path: string, ...handlers: Middleware[]) {
    this.trie.insert("PUT", path, handlers);
  }

  delete(path: string, ...handlers: Middleware[]) {
    this.trie.insert("DELETE", path, handlers);
  }
  get(path: string, ...handlers: Middleware[]) {
    this.trie.insert("GET", path, handlers);
  }

  useRoute(path: string, subRouter: Router) {
    // Pass down middlewares to sub-router
    subRouter.middlewares = [...this.middlewares, ...subRouter.middlewares];
    this.subRouters[path] = subRouter;
  }

  handle(
    req: ShahriarIncomingMessage,
    res: http.ServerResponse<ShahriarIncomingMessage>
  ): void {
    try {
      const parsedUrl = url.parse(req.url || "", true);
      const method = req.method || "GET";
      const path = parsedUrl.pathname || "";

      // Check if the request should be handled by a sub-router
      for (const subPath in this.subRouters) {
        if (path.startsWith(subPath)) {
          const subRouter = this.subRouters[subPath];
          req.url = path.slice(subPath.length) || "/";
          return subRouter.handle(req, res);
        }
      }

      const routeMatch = this.trie.search(method, path);
      if (!routeMatch) {
        throw new MyErrorHandler("Route not found", 404);
      }
      req.params = routeMatch.params;
      req.query = Object.fromEntries(
        Object.entries(parsedUrl.query).filter(
          ([_, value]) => value !== undefined
        )
      ) as { [key: string]: string | string[] };

      const handlers = routeMatch.handlers;
      const allHandlers = [...this.middlewares, ...handlers];

      let index = 0;
      const next = (err?: any) => {
        if (err) {
          return this.handleError(err, req, res);
        }
        if (index < allHandlers.length) {
          const handler = allHandlers[index++];
          try {
            handler(req, res, next);
          } catch (error) {
            next(error);
          }
        }
      };

      next();
    } catch (err) {
      return this.handleError(err, req, res);
    }
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
        sendError(res, err);
      }
    };

    next();
  }
}
