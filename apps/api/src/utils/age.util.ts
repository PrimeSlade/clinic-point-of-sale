import { startOfDay, endOfDay, subYears } from "date-fns";
const getAgeDateRange = (age: number) => {
  const today = new Date();

  const start = startOfDay(subYears(today, age + 1));

  const end = endOfDay(subYears(today, age));

  return { start, end };
};

const isAge = (input: string): boolean => {
  const age = Number(input);

  return age >= 1 && age <= 130;
};

export { getAgeDateRange, isAge };
