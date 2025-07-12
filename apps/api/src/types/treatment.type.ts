type Treatment = {
  doctorId: string;
  patientId: number;
  diagnosis?: string;
  treatment?: string;
};

type UpdateTreatment = Partial<Treatment>;

export { Treatment, UpdateTreatment };
