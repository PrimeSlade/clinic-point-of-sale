type Doctor = {
  name: string;
  email: string;
  commission: number;
  address?: string;
  description?: string;
  phoneNumber: string;
  locationId: number;
};

type UpdateDoctor = Partial<Doctor>;

export { Doctor, UpdateDoctor };
