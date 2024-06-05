import { Router, Request, Response } from "express";
import {
  scrapeGeralMangaPage,
  scrapeLatestMangaPage,
  scrapeMangaDetailsPage,
  scrapTrendingeMangaPage,
  scrapeMangaReadingPage,
  scrapeMangaTitleEpisodesPage,
} from "../services/Mangananquim";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const mangas = await scrapeGeralMangaPage("https://mangananquim.site");
  return res.json(mangas);
});

router.get("/trending", async (req: Request, res: Response) => {
  const mangas = await scrapTrendingeMangaPage(
    "https://mangananquim.site/?m_orderby=trending"
  );
  return res.json(mangas);
});

router.get("/latest", async (req: Request, res: Response) => {
  const latestMangas = await scrapeLatestMangaPage(
    "https://mangananquim.site/?m_orderby=latest"
  );
  return res.json(latestMangas);
});

router.get("/manga/:name", async (req: Request, res: Response) => {
  const { name } = req.params;
  const mangaDetails = await scrapeMangaDetailsPage(
    `https://mangananquim.site/ler-manga/${name}`
  );
  return res.json(mangaDetails);
});

router.get(
  "/manga/:name/:chapter/read",
  async (req: Request, res: Response) => {
    const { name, chapter } = req.params;

    const mangaDetails = await scrapeMangaReadingPage(
      `https://mangananquim.site/ler-manga/${name}/${chapter}/?style=list`
    );
    return res.json(mangaDetails);
  }
);

router.get(
  "/manga/get-episodes-by-title/:name",
  async (req: Request, res: Response) => {
    const { name } = req.params;

    const mangaEpisodesWithTitle = await scrapeMangaTitleEpisodesPage(
      `https://mangananquim.site/ler-manga/${name}`,
      name
    );
    return res.json(mangaEpisodesWithTitle);
  }
);

export default router;
