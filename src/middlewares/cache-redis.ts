import { Request, Response, NextFunction } from "express";
import { createClient } from "redis";

export const redisClient = createClient();

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect();
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
