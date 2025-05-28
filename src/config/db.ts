import knex from 'knex';
import knexConfig from '../knexfile';

// Select environment-specific config if needed in the future
const environment = process.env.NODE_ENV || 'development';
const config = {
  ...knexConfig,
};

const db = knex(config);

export default db;