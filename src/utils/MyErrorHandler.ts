import http from "http";
import { ShahriarIncomingMessage } from "./Router";

export class MyErrorHandler extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
    this.name = "MyErrorHandler";
  }
}

export default MyErrorHandler;

export function sendError(
  res: http.ServerResponse<ShahriarIncomingMessage>,
  err: any
) {
  let status = 400;
  let message = "Bad Request";
  if (err instanceof MyErrorHandler) {
    status = err.status || 500;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: message }));
}
