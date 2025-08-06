type Treatment = {
  doctorId: string;
  patientId: number;
  diagnosis?: string;
  treatment?: string;
};

type TreatmentQueryParams = {
  offset: number;
  limit: number;
  search: string;
  startDate?: string;
  endDate?: string;
};

type UpdateTreatment = Partial<Treatment>;

export { Treatment, UpdateTreatment, TreatmentQueryParams };
