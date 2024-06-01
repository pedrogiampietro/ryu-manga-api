import express, { Request, Response } from "express";
import {
  scrapeLatestMangaPage,
  scrapeMangaDetailsPage,
  scrapeMangaPage,
  scrapeMangaReadingPage,
} from "./services/Mangananquim";

const app = express();
app.use(express.json());

app.get("/trending", async (req: Request, res: Response) => {
  const mangas = await scrapeMangaPage(
    "https://mangananquim.site/?m_orderby=trending"
  );
  res.json(mangas);
});

app.get("/latest", async (req: Request, res: Response) => {
  const latestMangas = await scrapeLatestMangaPage(
    "https://mangananquim.site/?m_orderby=latest"
  );
  res.json(latestMangas);
});

app.get("/manga/:name", async (req: Request, res: Response) => {
  const { name } = req.params;
  const mangaDetails = await scrapeMangaDetailsPage(
    `https://mangananquim.site/ler-manga/${name}`
  );
  res.json(mangaDetails);
});

app.get("/manga/:name/read", async (req: Request, res: Response) => {
  const { name } = req.params;
  const mangaDetails = await scrapeMangaReadingPage(
    `https://mangananquim.site/ler-manga/chainsaw-man/capitulo-148-chainsaw-man/?style=list`
  );
  res.json(mangaDetails);
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
