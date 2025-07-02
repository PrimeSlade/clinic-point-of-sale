import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("locations").del();
  await knex("phone_numbers").del();

  // Inserts seed entries
  const [phone] = await knex("phone_numbers")
    .insert({ number: "0988741122" })
    .returning("id");

  await knex("locations").insert({
    id: 1,
    name: "Yangons",
    phone_number_id: phone.id,
    address: "no1",
  });
}
