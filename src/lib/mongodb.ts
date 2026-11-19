import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * One shared MongoDB client per server process.
 *
 * Cloud Run may run several copies of the app, and each copy handles many
 * requests. Reusing a single client (instead of connecting per request) keeps
 * us well under MongoDB Atlas's connection limits. In development, the client
 * is stored on `globalThis` so hot reloads don't open new connections.
 *
 * The client is created lazily (on first use, not at import time) so building
 * the app doesn't need database settings. The driver connects automatically on
 * the first query.
 */

const globalForMongo = globalThis as unknown as {
  _pytrekMongoClient?: MongoClient;
};

/** The shared MongoClient (created on first call). */
export function getMongoClient(): MongoClient {
  if (!globalForMongo._pytrekMongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
    }
    globalForMongo._pytrekMongoClient = new MongoClient(uri, { appName: "pytrek" });
  }
  return globalForMongo._pytrekMongoClient;
}

/** The PyTrek database (name from MONGODB_DB, default "pytrek"). */
export function getDb(): Db {
  return getMongoClient().db(process.env.MONGODB_DB || "pytrek");
}
