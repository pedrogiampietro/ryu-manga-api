import express, { Response, NextFunction } from "express";
import cors from "cors";

import ananquimRoutes from "./routes/ananquim.routes";
import authRoutes from "./routes/auth.routes";

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

app.use("/api/ananquim", ananquimRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
