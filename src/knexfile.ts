import type { Knex } from 'knex';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const connection: string | Knex.PgConnectionConfig = process.env.DATABASE_URL!
  ? process.env.DATABASE_URL
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    };

const config: Knex.Config = {
  client: 'pg',
  connection,
  migrations: {
    directory: path.join(__dirname, 'migrations'),
    extension: isProd ? 'js' : 'ts',
  },
};

export default config;
