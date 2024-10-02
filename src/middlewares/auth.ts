import { Response, NextFunction } from "express";
import { supabase } from "../services/supabase";

export const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data) {
    return res.status(401).json({ error: "Token inválido" });
  }

  req.userId = data.user.id;

  next();
};
