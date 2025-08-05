export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export enum PatientStatus {
  NEW_PATIENT = "new_patient",
  FOLLOW_UP = "follow_up",
  POST_OP = "post_op",
}

export enum PatientCondition {
  DISABLE = "disable",
  PREGNANT_WOMAN = "pregnant_woman",
}

export enum Department {
  OG = "og",
  OTO = "oto",
  SURGERY = "surgery",
  GENERAL = "general",
}

export enum PatientType {
  IN = "in",
  OUT = "out",
}

type Patient = {
  name: string;
  email?: string;
  gender: Gender;
  dateOfBirth: Date;
  address?: string;
  patientStatus: PatientStatus;
  patientCondition: PatientCondition;
  patientType: PatientType;
  department: Department;
  phoneNumber: string;
  locationId: number;
};

type UpdatePatient = Partial<Patient>;

export { Patient, UpdatePatient };
