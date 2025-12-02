// db.js
import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://ezzmasre2002_db_user:jLkfE85Bc5CVgSS@cluster0.mtcnwdh.mongodb.net/?retryWrites=true&w=majority";

let client;
let db;

export async function connectDB() {
  if (db) return db;

  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  console.log("Connected to MongoDB Atlas");

  db = client.db("palestinian_eateries"); // database name
  return db;
}
