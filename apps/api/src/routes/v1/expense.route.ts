import { Router } from "express";
import * as expenseController from "../../controllers/expense.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post("/add", authorize("create", "Expense"), expenseController.addExpense);
router.get("/", authorize("read", "Expense"), expenseController.getExpenses);
router.put("/:id", authorize("update", "Expense"), expenseController.updateExpense);
router.delete("/:id", authorize("delete", "Expense"), expenseController.deleteExpense);

export default router;
