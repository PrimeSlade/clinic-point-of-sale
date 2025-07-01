import type { Knex } from "knex";

//ENUMS
const unit_type = [
  "btl",
  "amp",
  "tube",
  "strip",
  "cap",
  "pcs",
  "sac",
  "box",
  "pkg",
  "tab",
];
const gender = ["male", "female"];
const status = ["new_patient", "follow_up", "post_op"];
const patient_condition = ["disable", "pregnant_woman"];
const department = ["og", "oto", "surgery", "general"];
const patient_type = ["in", "out"];

export async function up(knex: Knex): Promise<void> {
  //PHONE NUMBERS
  await knex.schema.createTable("phone_numbers", function (table) {
    table.increments("id").primary();
    table.string("numbers", 30).unique().notNullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  //LOCATIONS
  await knex.schema.createTable("locations", function (table) {
    table.increments("id").primary();
    table.text("name").notNullable();

    //One to One
    table
      .integer("phone_number_id")
      .notNullable()
      .references("id") // The column it references in the other table (usually 'id')
      .inTable("phone_numbers")
      .unique();
    table.text("address");
  });

  //ITEMS
  await knex.schema.createTable("items", function (table) {
    table.increments("id").primary();
    table.text("name").notNullable();
    table.text("category").notNullable();
    table.date("expiry_date").notNullable();

    table.smallint("price_percent");

    table
      .integer("location_id")
      .notNullable()
      .references("id")
      .inTable("locations");

    table.enu("unit_type_1", unit_type).notNullable();
    table.integer("unit_1").notNullable();
    table.decimal("purchase_price_1", 10, 2).notNullable();

    table.enu("unit_type_2", unit_type).notNullable();
    table.integer("unit_2").notNullable();
    table.decimal("purchase_price_2", 10, 2).notNullable();

    table.enu("unit_type_3", unit_type).notNullable();
    table.integer("unit_3").notNullable();
    table.decimal("purchase_price_3", 10, 2).notNullable();

    table.text("description");
  });

  //SERVICES
  await knex.schema.createTable("services", function (table) {
    table.increments("id").primary();
    table.text("name").notNullable();
    table.decimal("retail_price", 10, 2).notNullable();
  });

  //PATIENTS
  await knex.schema.createTable("patients", function (table) {
    table.increments("id").primary();
    table.string("name", 100).notNullable();

    //Many to One
    table
      .integer("phone_number_id")
      .notNullable()
      .references("id")
      .inTable("phone_numbers");

    table
      .integer("location_id")
      .notNullable()
      .references("id")
      .inTable("locations");

    table.enu("gender", gender).notNullable();
    table.date("date_of_birth");
    table.text("address");
    table.enu("patient_status", status).notNullable();
    table.enu("patient_condition", patient_condition).notNullable();
    table.enu("department", department).notNullable();
    table.enu("patient_type", patient_type).notNullable();
    table.timestamp("registered_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  //DOCTORS
  await knex.schema.createTable("doctors", function (table) {
    table.increments("id").primary();
    table.string("name", 100).notNullable();

    table
      .integer("location_id")
      .notNullable()
      .references("id")
      .inTable("locations");

    table
      .integer("phone_number_id")
      .notNullable()
      .references("id")
      .inTable("phone_numbers");

    table.decimal("commission", 10, 2).notNullable();
    table.text("address").notNullable();
    table.text("description");
  });

  //TREATMENTS
  await knex.schema.createTable("treatments", function (table) {
    table.increments("id").primary();

    table
      .integer("doctor_id")
      .notNullable()
      .references("id")
      .inTable("doctors");

    table
      .integer("patient_id")
      .notNullable()
      .references("id")
      .inTable("patients");

    table.text("treatment");
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  //INVOICES
  await knex.schema.createTable("invoices", function (table) {
    table.increments("id").primary();

    table
      .integer("location_id")
      .notNullable()
      .references("id")
      .inTable("locations");

    table
      .integer("treatment_id")
      .notNullable()
      .references("id")
      .inTable("treatments")
      .unique();

    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("roles", function (table) {
    table.increments("id").primary();
    table.string("name", 80).notNullable();
  });

  await knex.schema.createTable("users", function (table) {
    table.increments("id").primary();
    table.string("name", 100).notNullable();
    table.string("email", 255).notNullable().unique();
    table.text("password").notNullable();

    table.integer("role_id").notNullable().references("id").inTable("roles");
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());

    table
      .integer("location_id")
      .notNullable()
      .references("id")
      .inTable("locations");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("roles");
  await knex.schema.dropTableIfExists("invoices");
  await knex.schema.dropTableIfExists("treatments");
  await knex.schema.dropTableIfExists("doctors");
  await knex.schema.dropTableIfExists("patients");
  await knex.schema.dropTableIfExists("phone_numbers");
  await knex.schema.dropTableIfExists("locations");
  await knex.schema.dropTableIfExists("services");
  await knex.schema.dropTableIfExists("items");
}
