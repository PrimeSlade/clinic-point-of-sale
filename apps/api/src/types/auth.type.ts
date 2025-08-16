type LoginCredentials = {
  email: string;
  password: string;
};

type UserInfo = {
  name: string;
  email: string;
  password: string;
  locationId: number;
  roleId: number;
  pricePercent: number;
};

export type { LoginCredentials, UserInfo };
