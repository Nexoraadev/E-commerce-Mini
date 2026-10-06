import { Role } from "@prisma/client";
import { userRepository } from "@/repositories/user.repository";
import { comparePassword, hashPassword, type JwtPayload } from "@/lib/auth";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validations/auth";

export const authService = {
  async register(input: RegisterInput) {
    const data = registerSchema.parse(input);
    const existing = await userRepository.findByEmailOrUserName(data.email);
    const existingUserName = await userRepository.findByUserName(data.userName);
    if (existing || existingUserName) throw new Error("Email atau username sudah digunakan");

    const user = await userRepository.create({
      userName: data.userName,
      email: data.email,
      password: await hashPassword(data.password),
      namaLengkap: data.namaLengkap,
      role: Role.CUSTOMER,
    });

    return this.toSessionPayload(user);
  },

  async login(input: LoginInput) {
    const data = loginSchema.parse(input);
    const user = await userRepository.findByEmailOrUserName(data.identifier);
    if (!user) throw new Error("Email/username atau password salah");

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) throw new Error("Email/username atau password salah");

    return this.toSessionPayload(user);
  },

  toSessionPayload(user: { id: string; userName: string; email: string; namaLengkap: string; role: Role }): JwtPayload {
    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
      namaLengkap: user.namaLengkap,
      role: user.role,
    };
  },
};
