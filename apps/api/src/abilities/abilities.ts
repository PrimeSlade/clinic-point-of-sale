import { AbilityBuilder, PureAbility } from "@casl/ability";
import { createPrismaAbility, PrismaQuery } from "@casl/prisma";
import { UserInfo } from "../types/auth.type";

export type Actions = "manage" | "read" | "create" | "update" | "delete";
export type Subjects =
  | "all"
  | "PhoneNumber"
  | "Location"
  | "Item"
  | "ItemUnit"
  | "Service"
  | "Patient"
  | "Doctor"
  | "Treatment"
  | "Invoice"
  | "InvoiceItem"
  | "User"
  | "Role"
  | "Permission"
  | "Category"
  | "Expense";

export type AppAbility = PureAbility<[Actions, Subjects], PrismaQuery>;

const defineAbilities = async (user: UserInfo) => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createPrismaAbility,
  );

  if (user.role.name.toUpperCase() === "ADMIN") {
    can("manage", "all");
  } else {
    user?.role.permissions.forEach((perm) => {
      let conditions = {};

      if (perm.subject === "Location") {
        conditions = { id: user.locationId };
      } else {
        conditions = { locationId: user.locationId };
      }

      can(perm.action as Actions, perm.subject as Subjects, conditions);
    });
  }

  return build();
};

export default defineAbilities;
