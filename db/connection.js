import * as SQLite from 'expo-sqlite';

let db = null;

export const getDB = async () => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('mydatabase.db');
  return db;
};