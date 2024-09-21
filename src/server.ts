import http from "http";
import url from "url";
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
  const parsedUrl = url.parse(req.url || "", true);

  const myRouter = new Router();
  myRouter.use((req, res, next) => {
    console.log("Request received");
    next();
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

  // myRouter.handle(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
