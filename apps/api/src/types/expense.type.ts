type Expense = {
  name: string;
  amount: number;
  date: Date;
  description?: string;
  locationId: number;
  categoryId: number;
};

export { Expense };
