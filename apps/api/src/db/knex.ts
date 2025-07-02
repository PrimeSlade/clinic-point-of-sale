import Knex from "knex";
import knexStringcase from "knex-stringcase";

const knex = Knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
  ...knexStringcase(),
});

export default knex;
