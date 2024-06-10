import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const saveLastRead = async (request: Request, response: Response) => {
  const {
    userId,
    mangaId,
    cover,
    title,
    episodio,
    currentEpisode,
    totalEpisodes,
  } = request.body;

  const progress = (Number(currentEpisode) / Number(totalEpisodes)) * 100;

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
      const dbPath = `uploads/${mangaId}.png`;

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
            cover: dbPath,
            points: 0,
          },
        });
      } else {
        manga = await prisma.manga.update({
          where: {
            id: mangaId,
          },
          data: {
            cover: dbPath,
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

      let incrementalProgress = 0;

      if (lastRead) {
        incrementalProgress = progress - lastRead.progress;

        lastRead = await prisma.lastWatched.update({
          where: {
            id: lastRead.id,
          },
          data: {
            date: new Date(),
            episode: episodio,
            progress: progress,
            previousProgress: lastRead.progress,
          },
        });
      } else {
        incrementalProgress = progress;

        lastRead = await prisma.lastWatched.create({
          data: {
            userId: userId,
            mangaId: manga.id,
            episode: episodio,
            progress: progress,
            previousProgress: 0,
          },
        });
      }

      let user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        response.status(404).json({ error: "Usuário não encontrado" });
      } else {
        const points = Math.floor(incrementalProgress);

        user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            points: user.points + points,
          },
        });
      }

      response.status(201).json(lastRead);
    });
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
