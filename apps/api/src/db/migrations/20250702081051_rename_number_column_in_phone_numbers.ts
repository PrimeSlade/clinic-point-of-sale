import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("phone_numbers", function (table) {
    table.renameColumn("numbers", "number");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("phone_numbers", function (table) {
    table.renameColumn("number", "numbers");
  });
}
