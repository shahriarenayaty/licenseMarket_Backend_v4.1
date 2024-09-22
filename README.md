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

- **Handling Requests**: The `handle` method processes incoming requests. It parses the URL, determines the HTTP method, and searches the trie for a matching route.

  ```typescript
  handle(req: ShahriarIncomingMessage, res: http.ServerResponse<ShahriarIncomingMessage>): void {
  // Parse URL and method
  const parsedUrl = url.parse(req.url || "", true);
  const method = req.method || "GET";
  const path = parsedUrl.pathname || "";

  // Check for sub-router
  for (const subPath in this.subRouters) {
  if (path.startsWith(subPath)) {
      const subRouter = this.subRouters[subPath];
      req.url = path.slice(subPath.length) || "/";
      return subRouter.handle(req, res);
  }
  }

  // Search for route in trie
  const routeMatch = this.trie.search(method, path);
  if (!routeMatch) {
  throw new MyErrorHandler("Route not found", 404);
  }

  // Set request parameters and query
  req.params = routeMatch.params;
  req.query = Object.fromEntries(
  Object.entries(parsedUrl.query).filter(([_, value]) => value !== undefined)
  ) as { [key: string]: string | string[] };

  // Execute handlers
  const handlers = routeMatch.handlers;
  const allHandlers = [...this.middlewares, ...handlers];
  }
  ```

### RouteTrie Class

The `RouteTrie` class in `src/utils/Route.ts` implements the trie structure for storing routes.

- **Inserting Routes**: The `insert` method adds a route to the trie. It splits the path into segments and creates nodes in the trie for each segment.

  ```typescript
    insert(method: string, path: string, handlers: Middleware[]) {
  const segments = [method, ...path.split("/").filter(Boolean)];
  let currentNode = this.root;

  for (const segment of segments) {
    if (segment === "*") {
      if (!currentNode.wildcard) {
        currentNode.wildcard = new TrieNode();
      }
      currentNode = currentNode.wildcard;
    } else if (segment.startsWith(":")) {
      if (!currentNode.children[":"]) {
        currentNode.children[":"] = new TrieNode();
      }
      currentNode = currentNode.children[":"];
      currentNode.paramName = segment.slice(1);
    } else {
      if (!currentNode.children[segment]) {
        currentNode.children[segment] = new TrieNode();
      }
      currentNode = currentNode.children[segment];
    }
  }

  currentNode.handlers = handlers;
  }
  ```

- **Searching Routes**:The `search` method looks for a matching route in the trie. It traverses the trie based on the segments of the path and returns the handlers and parameters if a match is found.

  ```typescript
  search(method: string, path: string) {
  const segments = [method, ...path.split("/").filter(Boolean)];
  let currentNode = this.root;
  const params: { [key: string]: string } = {};

  for (const segment of segments) {
    if (currentNode.children[segment]) {
      currentNode = currentNode.children[segment];
    } else if (currentNode.children[":"]) {
      currentNode = currentNode.children[":"];
      if (currentNode.paramName) {
        params[currentNode.paramName] = segment;
      }
    } else if (currentNode.wildcard) {
      currentNode = currentNode.wildcard;
      break;
    } else {
      return null;
    }
  }

  if (currentNode.handlers) {
    return { handlers: currentNode.handlers, params };
  }

  retur null;
  }
  ```

### Error Handling

Error handling is managed by the `MyErrorHandler` class and the `sendError` function in `src/utils/MyErrorHandler.ts`. When an error occurs, the `sendError` function sends an appropriate HTTP response with the error message and status code.

### Example Usage

In `src/route/users.ts`, custom routes are defined for user operations:

```typescript
const userRouter = new Router();

userRouter.get("/", (req, res, next) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ users: ["user1", "user2"] }));
});

userRouter.post("/", (req, res, next) => {
  console.log("Received data:", req.body);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "User created", data: req.body }));
});

userRouter.put("/:id", (req, res, next) => {
  const userId = req.params?.id;
  console.log(`Updating user with ID: ${userId}`, req.body);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({ message: `User ${userId} updated`, data: req.body })
  );
});

export default userRouter;
```
