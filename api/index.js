import app from '../backend/src/server.js';
import connectDB from '../backend/src/lib/db.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to database in serverless handler:', error);
      return res.status(500).json({ error: 'Internal Server Error (DB Connection)' });
    }
  }
  return app(req, res);
}
