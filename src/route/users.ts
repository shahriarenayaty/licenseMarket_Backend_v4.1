import { Router } from "../utils/Router";

export function userRoutes(router: Router) {
  // Custom GET route
  router.get("/users", (req, res, next) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ users: ["user1", "user2"] }));
  });

  // Custom POST route
  router.post("/users", (req, res, next) => {
    console.log("Received data:", req.body);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User created", data: req.body }));
  });

  // Custom PUT route
  router.put("/users/:id", (req, res, next) => {
    const userId = req.params?.id;
    console.log(`Updating user with ID: ${userId}`, req.body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: `User ${userId} updated`, data: req.body })
    );
  });
}
