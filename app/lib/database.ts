import mysql, { type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  maxIdle: 1,
  idleTimeout: 10*60*1000,
});

export default pool;

export type Row = RowDataPacket;

export type SetResult = ResultSetHeader;
