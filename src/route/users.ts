import { Router } from "../utils/Router";

const userRouter = new Router();

// Custom GET route
userRouter.get("/", (req, res, next) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ users: ["user1", "user2"] }));
});

// Custom POST route
userRouter.post("/", (req, res, next) => {
  console.log("Received data:", req.body);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "User created", data: req.body }));
});

// Custom PUT route
userRouter.put("/:id", (req, res, next) => {
  const userId = req.params?.id;
  console.log(`Updating user with ID: ${userId}`, req.body);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({ message: `User ${userId} updated`, data: req.body })
  );
});

export default userRouter;
