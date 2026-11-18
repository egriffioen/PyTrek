import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * One shared MongoDB client per server process.
 *
 * Cloud Run may run several copies of the app, and each copy handles many
 * requests. Reusing a single client (instead of connecting per request) keeps
 * us well under MongoDB Atlas's connection limits. In development, the client
 * is stored on `globalThis` so hot reloads don't open new connections.
 */

const globalForMongo = globalThis as unknown as {
  _pytrekMongoClient?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> {
  if (!globalForMongo._pytrekMongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
    }
    const client = new MongoClient(uri, { appName: "pytrek" });
    globalForMongo._pytrekMongoClient = client.connect().catch((err) => {
      // Let the next request try again instead of caching a failed connection.
      globalForMongo._pytrekMongoClient = undefined;
      throw err;
    });
  }
  return globalForMongo._pytrekMongoClient;
}

/** The PyTrek database (name from MONGODB_DB, default "pytrek"). */
export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB || "pytrek");
}
