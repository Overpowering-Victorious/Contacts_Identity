import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('contacts', (table) => {
    table.increments('id').primary();
    table.string('email').nullable();
    table.string('phoneNumber').nullable();
    table.string('linkPrecedence').notNullable().defaultTo('primary');
    table.integer('linkedId').unsigned().nullable()
         .references('id').inTable('contacts').onDelete('SET NULL');
    table.timestamps(true, true);
    table.timestamp('deletedAt').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contacts');
}