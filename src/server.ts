import express, { Response, NextFunction } from "express";
import cors from "cors";
import path from "path";

import ananquimRoutes from "./routes/ananquim.routes";
import authRoutes from "./routes/auth.routes";
import favoritesRoutes from "./routes/favorites.routes";
import lastWatchedRoutes from "./routes/lastWatched.routes";
import lerMangasRoutes from "./routes/lermangas.routes";

const app = express();
app.use(express.json());

app.use((_: any, response: Response, next: NextFunction) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,PATCH"
  );
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  response.header("Access-Control-Expose-Headers", "x-total-count");

  return next();
});

app.use(
  cors({
    origin: "*",
    // credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/v1/ananquim", ananquimRoutes);
app.use("/v1/lermangas", lerMangasRoutes);
app.use("/v1/auth", authRoutes);
app.use("/v1/favorites", favoritesRoutes);
app.use("/v1/lastWatched", lastWatchedRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
