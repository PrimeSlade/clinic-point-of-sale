type RoleForm = {
  name: string;
};

type PermissionInfo = {
  id?: number;
  roleId?: number | null;
  action: string; // Actions your CASL supports
  subject: string; // Subjects your CASL supports
};

type RoleInfo = {
  id: number;
  name: string;
  permissions: PermissionInfo[];
};

type AssignRoleFrom = {
  roleId: number;
  userId: string;
  permissions: { id: number }[];
};

export { RoleForm, PermissionInfo, RoleInfo, AssignRoleFrom };
