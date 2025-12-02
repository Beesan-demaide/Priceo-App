// eateryService.js
import { connectDB } from "./db.js";

export async function getAllEateries() {
  const db = await connectDB();
  return db.collection("eateries").find({}).toArray();
}

export async function getEateriesByCity(city) {
  const db = await connectDB();
  return db.collection("eateries").find({ city }).toArray();
}

export async function getEateryById(id) {
  const db = await connectDB();
  return db.collection("eateries").findOne({ id });
}
