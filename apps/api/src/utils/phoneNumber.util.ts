import * as phoneNumberModel from "../models/phoneNumber.model";

const ensurePhoneNumberExists = async (phoneNumber: string, trx: any) => {
  const exists = await phoneNumberModel.findNumber(phoneNumber, trx);

  if (!exists) {
    await phoneNumberModel.createNumber(phoneNumber, trx);
  }
};

export { ensurePhoneNumberExists };
