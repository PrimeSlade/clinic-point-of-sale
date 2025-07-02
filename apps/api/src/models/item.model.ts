import knex from "../db/knex";
import { Item } from "../types/items.types";

const addItem = async (items: Item) => {
  return knex("items").insert(items).returning("*");
};

const getItems = async () => {
  return knex<Item>("items").select("*");
};

export { addItem, getItems };
