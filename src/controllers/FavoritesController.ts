import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addFavorite = async (request: Request, response: Response) => {
  const { userId, mangaId, title, cover } = request.body;

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
          title: title,
          link: mangaId,
          cover: cover,
        },
      });
    }

    const favorite = await prisma.favorites.create({
      data: {
        userId,
        mangaId: manga.id,
      },
    });

    response.status(201).json(favorite);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Algo deu errado" });
  }
};

export const getFavorites = async (request: Request, response: Response) => {
  const { userId } = request.params;

  try {
    const favorites = await prisma.favorites.findMany({
      where: {
        userId: userId,
      },
      include: {
        manga: true,
      },
    });

    response.json(favorites);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Algo deu errado" });
  }
};
