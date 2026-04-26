import { getDB } from "./connection";

export const initDB = async () => {
    const db = await getDB()
  // Create tables here
  await db.execAsync(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT UNIQUE,
          title TEXT,
          description TEXT,
          dateTime TEXT
        );
      `);

//   console.log("DB Ready");
};
