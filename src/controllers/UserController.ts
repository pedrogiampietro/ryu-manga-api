import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const updateUser = async (request: Request, response: Response) => {
  const { name, birthDate, username, email, bio, theme, font, userId } =
    request.body;
  const photo = request.file;

  const data: { [key: string]: any } = {};

  if (name) data.name = name;
  if (birthDate) data.birthDate = new Date(birthDate);
  if (username) data.username = username;
  if (email) data.email = email;
  if (bio) data.bio = bio;
  if (theme) data.theme = theme;
  if (font) data.font = font;

  if (photo) {
    const avatarUrl = `http://${request.headers.host}/uploads/avatars/${photo.filename}`;
    data.avatar = avatarUrl;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser?.avatar) {
      const oldAvatarFilename = path.basename(existingUser.avatar);
      const oldAvatarPath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        "avatars",
        oldAvatarFilename
      );

      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        urls: true,
        birthDate: true,
        language: true,
        font: true,
        theme: true,
        lastWatched: true,
        favorites: true,
        avatar: true,
      },
    });

    return response.json({
      status: "success",
      message: "Dados do usuário atualizados com sucesso!",
      user,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário", error);

    return response.status(500).json({
      status: "error",
      message:
        "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
    });
  }
};
