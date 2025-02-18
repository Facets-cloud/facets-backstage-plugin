exports.up = async function up(knex) {
  await knex.schema.createTable('user_credentials', table => {
    table.string('username').primary(); // Primary key
    table.string('facets_username').notNullable();
    table.string('facets_accessToken').notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTable('user_credentials');
};