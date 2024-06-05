import { Router, Request, Response } from "express";
import {
  scrapTrendingeMangaPage,
  scrapeMangaDetailsPage,
  scrapeMangaReadingPage,
  scrapeMangaTitleEpisodesPage,
} from "../services/LerMangas";

const router = Router();

router.get("/trending", async (req: Request, res: Response) => {
  const mangas = await scrapTrendingeMangaPage("https://lermangas.me");
  if (!mangas) {
    return res.status(204).send();
  }
  return res.status(200).json(mangas);
});

router.get("/manga/:name", async (req: Request, res: Response) => {
  const { name } = req.params;
  const mangaDetails = await scrapeMangaDetailsPage(
    `https://lermangas.me/manga/${name}`
  );
  if (!mangaDetails) {
    return res.status(204).send();
  }
  return res.status(200).json(mangaDetails);
});

router.get(
  "/manga/:name/:chapter/read",
  async (req: Request, res: Response) => {
    const { name, chapter } = req.params;

    const mangaDetails = await scrapeMangaReadingPage(
      `https://lermangas.me/manga/${name}/${chapter}`
    );
    if (!mangaDetails) {
      return res.status(204).send();
    }
    return res.status(200).json(mangaDetails);
  }
);

router.get(
  "/manga/get-episodes-by-title/:name",
  async (req: Request, res: Response) => {
    const { name } = req.params;

    const mangaEpisodesWithTitle = await scrapeMangaTitleEpisodesPage(
      `https://lermangas.me/manga/${name}`
    );

    if (!mangaEpisodesWithTitle) {
      return res.status(204).send();
    }

    return res.status(200).json(mangaEpisodesWithTitle);
  }
);

export default router;
