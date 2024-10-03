import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const addFavorite = async (req: any, res: Response) => {
  const { mangaId, title, cover } = req.body;
  const userId = req.userId;

  if (!userId || !mangaId || !title || !cover) {
    return res.status(400).json({ error: "Campos necessários ausentes." });
  }

  const dirPath = path.join(__dirname, "../../uploads").replace(/\\/g, "/");

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  try {
    const result = await axios.get(cover, { responseType: "stream" });
    const imagePath = path.join(dirPath, `${mangaId}.png`).replace(/\\/g, "/");
    const writer = fs.createWriteStream(imagePath);
    result.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    let manga = await prisma.manga.findUnique({
      where: { id: mangaId },
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

    const existingFavorite = await prisma.favorites.findUnique({
      where: { identifier: title },
    });

    if (existingFavorite) {
      return res.status(400).json({ error: "Identifier já existe" });
    }

    const favorite = await prisma.favorites.create({
      data: {
        userId,
        mangaId,
        identifier: title,
      },
    });

    res.status(201).json(favorite);
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Mangá já foi favoritado" });
    }
    res.status(500).json({ error: "Algo deu errado" });
  }
};

export const getFavorites = async (req: any, res: Response) => {
  const userId = req.userId;

  try {
    const favorites = await prisma.favorites.findMany({
      where: {
        userId: userId,
      },
      include: {
        manga: true,
      },
    });

    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Algo deu errado" });
  }
};

export const deleteFavorite = async (req: any, res: Response) => {
  const { identifier } = req.body;
  const userId = req.userId;

  if (typeof identifier !== "string") {
    return res.status(400).json({ error: "identifier deve ser uma string" });
  }

  try {
    const favorite = await prisma.favorites.findFirst({
      where: {
        userId: userId,
        identifier: identifier,
      },
    });

    if (!favorite) {
      return res.status(404).json({ error: "Mangá favorito não encontrado" });
    }

    await prisma.favorites.delete({
      where: {
        identifier: favorite.identifier,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Algo deu errado" });
  }
};
