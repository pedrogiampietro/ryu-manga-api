import { Router, Request, Response } from "express";
import {
  scrapeGeralMangaPage,
  scrapeLatestMangaPage,
  scrapeMangaDetailsPage,
  scrapTrendingeMangaPage,
  scrapeMangaReadingPage,
} from "../services/Mangananquim";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const mangas = await scrapeGeralMangaPage("https://mangananquim.site");
  res.json(mangas);
});

router.get("/trending", async (req: Request, res: Response) => {
  const mangas = await scrapTrendingeMangaPage(
    "https://mangananquim.site/?m_orderby=trending"
  );
  res.json(mangas);
});

router.get("/latest", async (req: Request, res: Response) => {
  const latestMangas = await scrapeLatestMangaPage(
    "https://mangananquim.site/?m_orderby=latest"
  );
  res.json(latestMangas);
});

router.get("/manga/:name", async (req: Request, res: Response) => {
  const { name } = req.params;
  const mangaDetails = await scrapeMangaDetailsPage(
    `https://mangananquim.site/ler-manga/${name}`
  );
  res.json(mangaDetails);
});

router.get(
  "/manga/:name/:chapter/read",
  async (req: Request, res: Response) => {
    const { name, chapter } = req.params;

    const mangaDetails = await scrapeMangaReadingPage(
      `https://mangananquim.site/ler-manga/${name}/${chapter}/?style=list`
    );
    res.json(mangaDetails);
  }
);

export default router;
