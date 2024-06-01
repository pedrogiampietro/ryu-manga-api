import express from "express";
import ananquimRoutes from "./routes/ananquim.routes";

const app = express();
app.use(express.json());
app.use("/api/ananquim", ananquimRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
