import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const generatePassword = async (password: string): Promise<string> => {
  return bcryptjs.hash(password, 12);
};

const verfiyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcryptjs.compare(password, hashedPassword);
};

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

const verfiyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export { generatePassword, verfiyPassword, generateToken, verfiyToken };
