import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const highscoresStats = async (request: Request, response: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        points: "asc",
      },
    });

    const formattedUsers = users.map((user, index) => ({
      id: index + 1,
      name: user.name,
      score: user.points,
      avatar: user.avatar,
    }));

    return response.json({
      status: "success",
      message: "Busca do ranking feita com sucesso!",
      body: formattedUsers,
    });
  } catch (error) {
    console.error("Erro ao buscar lista de rankings de usuário", error);

    return response.status(500).json({
      status: "error",
      message:
        "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
    });
  }
};
