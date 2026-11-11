// db.js
import "dotenv/config";   // must be first: its side effect runs before the imports below

import { MongoClient } from 'mongodb';
const uri: string = process.env.MONGODB_URI
const dbName = "ai-chatbot";

let client;
let db: any = null ;

export async function connectToMongo() {
    if (db) return db;

    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    // console.log("✅ MongoDB connected", db);
    return db;
} 

async function getDB() {
    if (!db) {
        await connectToMongo();
    }
    return db;
}

export async function getCollection(collectionName: string) {
    const database = await getDB();
    return database.collection(collectionName);
}

export async function closeConn() {
    await db.close();
}

// module.exports = {
//     connectToMongo,
//     getDB,
//     getCollection,
//     closeConn
// };