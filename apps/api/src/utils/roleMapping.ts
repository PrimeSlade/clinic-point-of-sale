import { UserInfo } from "../types/auth.type";

const PERMISSION_DEPENDENCIES: Record<
  string,
  { id: number; action: string; subject: string }
> = {
  Treatment: { id: 22, action: "read", subject: "Item" },
  User: { id: 26, action: "read", subject: "Location" },
  Expense: { id: 10, action: "read", subject: "Category" },
  Patient: { id: 26, action: "read", subject: "Location" },
  Item: { id: 26, action: "read", subject: "Location" },
};

export const resolvePermissionDependencies = (user: UserInfo): UserInfo => {
  const existingPermissionIds = new Set(
    user.role.permissions.map((perm) => perm.id),
  );

  const permissionsToAdd: Array<{
    id: number;
    action: string;
    subject: string;
  }> = [];

  user.role.permissions.forEach((prev) => {
    const dep = PERMISSION_DEPENDENCIES[prev.subject];

    if (dep && !existingPermissionIds.has(dep.id)) {
      permissionsToAdd.push(dep);
      existingPermissionIds.add(dep.id);
    }
  });

  return {
    ...user,
    role: {
      ...user.role,
      permissions: [...user.role.permissions, ...permissionsToAdd],
    },
  };
};
