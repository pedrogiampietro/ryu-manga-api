import { Request, Response, NextFunction } from "express";
import { createClient } from "redis";
import dotenv from "dotenv";

// Carregar variáveis de ambiente do .env
dotenv.config();

// Configurar a URL de conexão do Redis
const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
const redisOptions: any = {
  url: redisUrl,
};

// Se você estiver usando uma senha, adicione-a às opções
if (process.env.REDIS_PASSWORD) {
  redisOptions.password = process.env.REDIS_PASSWORD;
}

export const redisClient = createClient(redisOptions);

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("Conectado ao Redis com sucesso!");
  } catch (err) {
    console.error("Falha ao conectar ao Redis:", err);
  }
})();

const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.params;

  try {
    const cachedData = await redisClient.get(name);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      next();
    }
  } catch (err) {
    console.error("Erro ao acessar o Redis:", err);
    next();
  }
};

export default cacheMiddleware;
