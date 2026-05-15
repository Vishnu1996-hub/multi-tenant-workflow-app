import { prisma } from "../../db";

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = (data: {
  email: string;
  passwordHash: string;
  fullName: string;
}) => {
  return prisma.user.create({
    data,
  });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};
