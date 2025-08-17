import { AbilityBuilder, PureAbility } from "@casl/ability";
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

export type AppAbility = PureAbility<[Actions, Subjects]>;

const defineAbilities = async (user: UserInfo) => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

  user?.role.permissions.forEach((perm) => {
    can(perm.action as Actions, perm.subject as Subjects);
  });

  return build();
};

export default defineAbilities;
