import { Router } from "express";
import itemRoutes from "./item.route";
import locationRoutes from "./location.route";
import serviceRoutes from "./service.route";
import patientRoutes from "./patient.route";
import doctorRoutes from "./doctor.route";
import treatmentRoutes from "./treatment.route";
import categoryRoutes from "./category.route";
import expenseRoutes from "./expense.route";

const router = Router();

router.use("/items", itemRoutes);
router.use("/locations", locationRoutes);
router.use("/services", serviceRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/treatments", treatmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/expenses", expenseRoutes);

export default router;
