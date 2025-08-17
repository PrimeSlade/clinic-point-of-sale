type LoginCredentials = {
  email: string;
  password: string;
};

type PermissionInfo = {
  id: number;
  roleId: number;
  action: string; // Actions your CASL supports
  subject: string; // Subjects your CASL supports
};

type RoleInfo = {
  id: number;
  name: string;
  permissions: PermissionInfo[];
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  locationId: number;
  roleId: number;
  pricePercent: number;
};

type UserInfo = {
  id: string;
  name: string;
  email: string;
  locationId: number;
  roleId: number;
  pricePercent: number;
  role: RoleInfo;
};

export type { LoginCredentials, UserForm, UserInfo };
