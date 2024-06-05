import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const addFavorite = async (request: Request, response: Response) => {
  const { userId, mangaId, title, cover } = request.body;

  const dirPath = path.join(__dirname, "../../uploads").replace(/\\/g, "/");

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  try {
    const result = await axios.get(cover, { responseType: "stream" });
    const imagePath = path.join(dirPath, `${mangaId}.png`).replace(/\\/g, "/");
    const writer = fs.createWriteStream(imagePath);
    result.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    }).then(async () => {
      let manga = await prisma.manga.findUnique({
        where: {
          id: mangaId,
        },
      });

      const dbPath = `uploads/${mangaId}.png`;

      if (!manga) {
        manga = await prisma.manga.create({
          data: {
            id: mangaId,
            title: title,
            link: mangaId,
            cover: dbPath,
          },
        });
      }

      // Verifica se o mangá já foi favoritado
      const existingFavorite = await prisma.favorites.findMany({
        where: {
          userId: userId,
          mangaId: manga.id,
        },
      });

      // Se o mangá já foi favoritado, retorna um erro
      if (existingFavorite.length > 0) {
        return response.status(400).json({ error: "Mangá já foi favoritado" });
      }

      const favorite = await prisma.favorites.create({
        data: {
          userId,
          mangaId: manga.id,
        },
      });

      response.status(201).json(favorite);
    });
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

export const deleteFavorite = async (request: Request, response: Response) => {
  const { userId, mangaId } = request.query;

  if (typeof userId !== "string" || typeof mangaId !== "string") {
    return response.status(400).json({ error: "userId deve ser uma string" });
  }

  try {
    const favorite = await prisma.favorites.findFirst({
      where: {
        userId: userId,
        mangaId: mangaId,
      },
    });

    if (!favorite) {
      return response
        .status(404)
        .json({ error: "Mangá favorito não encontrado" });
    }

    await prisma.favorites.delete({
      where: {
        id: favorite.id,
      },
    });

    response.status(204).send();
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Algo deu errado" });
  }
};
