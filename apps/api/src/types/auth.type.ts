import { RoleInfo } from "./role.type";

type LoginCredentials = {
  email: string;
  password: string;
};

type UserForm = {
  id?: string;
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
