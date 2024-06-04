import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const saveLastRead = async (request: Request, response: Response) => {
  const { userId, mangaId, cover, title, episodio } = request.body;

  try {
    let manga = await prisma.manga.findUnique({
      where: {
        id: mangaId,
      },
    });

    if (!manga) {
      manga = await prisma.manga.create({
        data: {
          id: mangaId,
          title,
          link: "",
          cover,
        },
      });
    }

    let lastRead = await prisma.lastWatched.findUnique({
      where: {
        userId_mangaId: {
          userId: userId,
          mangaId: manga.id,
        },
      },
    });

    if (lastRead) {
      lastRead = await prisma.lastWatched.update({
        where: {
          id: lastRead.id,
        },
        data: {
          date: new Date(),
          episode: episodio,
        },
      });
    } else {
      lastRead = await prisma.lastWatched.create({
        data: {
          userId: userId,
          mangaId: manga.id,
          episode: episodio,
        },
      });
    }

    response.status(201).json(lastRead);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Algo deu errado" });
  }
};

export const getLastRead = async (request: Request, response: Response) => {
  const { userId } = request.query;

  if (typeof userId !== "string") {
    return response.status(400).json({ error: "userId deve ser uma string" });
  }

  try {
    const lastRead = await prisma.lastWatched.findMany({
      where: {
        userId: userId,
      },
      include: {
        manga: true,
      },
    });

    response.status(200).json(lastRead);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Algo deu errado" });
  }
};
