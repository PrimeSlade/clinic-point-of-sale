import knex from "../db/knex";
import { Item } from "../types/items.types";

const addItem = async (items: Item) => {
  const [added] = await knex("items").insert(items).returning("*");
  return added;
};

const getItems = async () => {
  return knex<Item>("items").select("*");
};

const updateItem = async (items: any, id: number) => {
  const updated = await knex("items").update(items).where(id).returning("*");
  return updateItem;
};
export { addItem, getItems, updateItem };
