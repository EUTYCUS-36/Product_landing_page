   import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// Custom Middleware - Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Fake Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === "Bearer mysecrettoken") {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Sample in-memory products array
let products = [
  { id: 1, name: "Laptop", price: 85000 },
  { id: 2, name: "Phone", price: 35000 },
];

// 📍 ROUTES
app.get("/api/products", (req, res) => {
  // Optional filtering
  const { search } = req.query;
  let filtered = products;
  if (search) {
    filtered = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  res.json(filtered);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  product
    ? res.json(product)
    : res.status(404).json({ message: "Product not found" });
});

app.post("/api/products", authenticate, (req, res) => {
  const { name, price } = req.body;
  const newProduct = {
    id: products.length + 1,
    name,
    price,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", authenticate, (req, res) => {
  const { name, price } = req.body;
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

app.delete("/api/products/:id", authenticate, (req, res) => {
  const index = products.findIndex((p) => p.id === parseInt(req.params.id));
  if (index !== -1) {
    const deleted = products.splice(index, 1);
    res.json({ message: "Product deleted", deleted });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));0

