import Knex from "knex";

export const knex = Knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
});
