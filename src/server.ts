import http from "http";
// import Router from "./utils/router";

import { Router } from "./utils/Router";
const PORT = process.env.PORT || 3000;

// Initialize an array of users to simulate a data store
let users = [
  {
    id: 1,
    name: "John Doe",
    phone: "123-456-7890",
    email: "john.doe@example.com",
    age: 30,
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "987-654-3210",
    email: "jane.smith@example.com",
    age: 25,
    address: "456 Elm St, Othertown, USA",
  },
  {
    id: 3,
    name: "Alice Johnson",
    phone: "555-123-4567",
    email: "alice.johnson@example.com",
    age: 28,
    address: "789 Oak St, Sometown, USA",
  },
];

const server = http.createServer((req, res) => {
  const myRouter = new Router();
  myRouter.use((req, res, next) => {
    console.log("Request received");
    next();
  });

  // Middleware to parse JSON body
  myRouter.use((req, res, next) => {
    if (req.method === "POST" || req.method === "PUT") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          if (body === "") body = "{}";
          req.body = JSON.parse(body);
          next();
        } catch (err) {
          next(err);
        }
      });
    } else {
      next();
    }
  });
  // Error handling middleware
  myRouter.useError((err, req, res, next) => {
    console.error("Error:", err);
    res.writeHead(500);
    res.end("Something went wrong");
  });
  // Custom route
  myRouter.get("/users", (req, res, next) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ users: ["user1", "user2"] }));
  });

  // Custom POST route
  myRouter.post("/users", (req, res, next) => {
    console.log("Received data:", req.body);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User created", data: req.body }));
  });

  // Custom PUT route
  myRouter.put("/users/:id", (req, res, next) => {
    const userId = req.params?.id;
    console.log(`Updating user with ID: ${userId}`, req.body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: `User ${userId} updated`, data: req.body })
    );
  });

  myRouter.handle(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
