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
  "/reports",
  authorize("read", "Report"),
  authorize("read", "Invoice"),
  invoiceController.getReportInvoices,
);

router.get(
  "/:id",
  authorize("read", "Invoice"),
  invoiceController.getInvoiceById,
);

router.delete(
  "/:id",
  authorize("delete", "Invoice"),
  invoiceController.deleteInvoice,
);

export default router;
