import "express";
import { AppAbility } from "../abilities/abilities"; // import your type

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    ability?: AppAbility;
  }
}
