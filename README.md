# licenseMarket_Backend_v4.1

This project demonstrates how to build a custom HTTP server from scratch using Node.js and TypeScript, without relying on popular web frameworks like Express or Nest.js. The server supports multiple HTTP methods (GET, POST, PUT, DELETE) and includes an efficient routing system, middleware implementation, and error handling mechanism.

## Project Structure

- **config/**: Contains environment configuration files.
- **src/**: Contains the main source code.
  - **route/**: Contains route definitions.
    - `users.ts`: Defines routes related to user operations.
  - **utils/**: Contains utility files.
    - `MyErrorHandler.ts`: Defines custom error handling logic.
    - `Route.ts`: Implements the routing trie structure.
    - `Router.ts`: Implements the main router logic.
  - `server.ts`: Entry point for the server.
- **nodemon.json**: Configuration for nodemon to watch file changes.
- **package.json**: Project metadata and dependencies.
- **tsconfig.json**: TypeScript configuration.

## Routing System

The routing system is implemented using a trie (prefix tree) structure, which allows for efficient route matching. Here’s a detailed explanation of how it works:

### Router Class

The `Router` class in `src/utils/Router.ts` is the core of the routing system. It provides methods to define routes and handle incoming requests.

- **Defining Routes**: Methods like `get`, `post`, `put`, and `delete` are used to define routes. These methods insert the route into the trie with the corresponding HTTP method and path.
  ```typescript
  post(path: string, ...handlers: Middleware[]) {
    this.trie.insert("POST", path, handlers);
  }
  ```
