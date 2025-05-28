import type { Knex } from 'knex';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: Number(process.env.DB_PORT),
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: path.resolve(__dirname, 'migrations'),
    extension: 'ts',
  },
};

export default config;
