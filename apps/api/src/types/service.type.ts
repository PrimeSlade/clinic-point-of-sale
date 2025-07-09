type Service = {
  name: string;
  retailPrice: number;
};

type UpdateService = Partial<Service>;

export { Service, UpdateService };
