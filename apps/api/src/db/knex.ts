import Knex from "knex";

export const knex = Knex({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
});
