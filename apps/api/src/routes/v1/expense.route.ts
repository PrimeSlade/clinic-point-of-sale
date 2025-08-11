import { Router } from "express";
import * as expenseController from "../../controllers/expense.controller";

const router = Router();

router.post("/add", expenseController.addExpense);
router.get("/", expenseController.getExpenses);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

export default router;
