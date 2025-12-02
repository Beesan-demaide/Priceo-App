import { MongoClient } from "mongodb"; // MongoDB client
import { eateriesData } from "./palestinian_eateries.js"; // Import the data

// MongoDB connection string (use your actual password)
const uri =
  "mongodb+srv://ezzmasre2002_db_user:jLkfE85Bc5CVgSS@cluster0.mtcnwdh.mongodb.net/?retryWrites=true&w=majority";

// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function uploadData() {
  try {
    // Log the connection attempt
    console.log("Attempting to connect to MongoDB Atlas...");

    // Connect to MongoDB Atlas
    await client.connect();
    console.log("Connected to MongoDB");

    // Specify the database and collection where the data will be stored
    const database = client.db("palestinian_eateries"); // Database name
    const collection = database.collection("eateries"); // Collection name

    // Log the insertion attempt
    console.log("Inserting data into collection...");

    // Insert the data into the collection
    const result = await collection.insertMany(eateriesData);
    console.log(`${result.insertedCount} documents were inserted`);
  } catch (err) {
    // Log the error details
    console.error("Error uploading data:", err.message);
    console.error("Error stack trace:", err.stack);
  } finally {
    // Ensure the MongoDB connection is closed properly
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

// Run the function to upload data
uploadData().catch(console.error);
