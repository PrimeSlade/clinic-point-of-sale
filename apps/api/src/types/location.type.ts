type Location = {
  name: string;
  address: string;
  phoneNumber: string;
};

type UpdateLoation = Partial<Location>;

export { Location, UpdateLoation };
