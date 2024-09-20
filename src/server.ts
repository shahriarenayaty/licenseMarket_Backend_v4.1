import http from "http";
import url from "url";
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
  //TODO: Handle CORS
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
