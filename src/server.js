// server.js
import express from "express";
import cors from "cors"; // ADD THIS LINE
import {
  getAllEateries,
  getEateriesByCity,
  getEateryById,
} from "./eateryService.js";

const app = express();
const PORT = 3000;

// ADD THESE 2 LINES (before your routes)
app.use(cors());
app.use(express.json());

// Route: get all
app.get("/eateries", async (req, res) => {
  try {
    const data = await getAllEateries();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route: by city
app.get("/eateries/city/:city", async (req, res) => {
  try {
    const data = await getEateriesByCity(req.params.city);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route: by ID
app.get("/eateries/:id", async (req, res) => {
  try {
    const data = await getEateryById(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
