import { Router } from "express";
import * as invoiceController from "../../controllers/invoice.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post(
  "/add",
  authorize("create", "Invoice"),
  invoiceController.createInvoice,
);
router.get("/", authorize("read", "Invoice"), invoiceController.getInvoices);
router.get(
  "/:id",
  authorize("read", "Invoice"),
  invoiceController.getInvoiceById,
);
router.put(
  "/:id",
  authorize("update", "Invoice"),
  invoiceController.updateInvoice,
);
router.delete(
  "/:id",
  authorize("delete", "Invoice"),
  invoiceController.deleteInvoice,
);

export default router;
