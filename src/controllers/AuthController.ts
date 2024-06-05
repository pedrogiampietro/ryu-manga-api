import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const register = async (request: Request, response: Response) => {
  const { name, email, password } = request.body;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    return response.status(400).json({
      status: "error",
      message: "O email já está em uso. Por favor, use um email diferente.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return response.json({
      status: "success",
      message: "Usuário registrado com sucesso!",
      user,
    });
  } catch (error) {
    console.error("Erro ao criar usuário", error);

    return response.status(500).json({
      status: "error",
      message:
        "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
    });
  }
};

export const login = async (request: Request, response: Response) => {
  const { email, password } = request.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return response
      .status(400)
      .json({ status: "error", message: "Usuário não encontrado" });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return response
      .status(400)
      .json({ status: "error", message: "Senha incorreta" });
  }
  const token = jwt.sign({ id: user.id }, "your_jwt_secret");
  response.json({
    status: "success",
    message: "Login bem-sucedido",
    token,
    user: {
      userId: user.id,
      name: user.name,
      email: user.email,
    },
  });
};
