import { Router, Request, Response } from "express";
import {
  scrapeGeralMangaPage,
  scrapeLatestMangaPage,
  scrapeMangaDetailsPage,
  scrapTrendingeMangaPage,
  scrapeMangaReadingPage,
  scrapeMangaTitleEpisodesPage,
} from "../services/Mangananquim";
import cacheMiddleware, { redisClient } from "../middlewares/cache-redis";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const mangas = await scrapeGeralMangaPage("https://mangananquim.site");
  if (!mangas) {
    return res.status(204).send();
  }
  return res.status(200).json(mangas);
});

router.get("/trending", async (req: Request, res: Response) => {
  const mangas = await scrapTrendingeMangaPage(
    "https://mangananquim.site/?m_orderby=trending"
  );
  if (!mangas) {
    return res.status(204).send();
  }

  return res.status(200).json(mangas);
});

router.get("/latest", async (req: Request, res: Response) => {
  const latestMangas = await scrapeLatestMangaPage(
    "https://mangananquim.site/?m_orderby=latest"
  );
  if (!latestMangas) {
    return res.status(204).send();
  }
  return res.status(200).json(latestMangas);
});

router.get(
  "/manga/:name",
  cacheMiddleware,
  async (req: Request, res: Response) => {
    const { name } = req.params;

    try {
      const mangaDetails = await scrapeMangaDetailsPage(
        `https://mangananquim.site/ler-manga/${name}`
      );

      if (!mangaDetails) {
        return res.status(204).send();
      }

      // Armazena os dados no Redis com expiração de 1 hora
      await redisClient.setEx(name, 3600, JSON.stringify(mangaDetails));

      return res.status(200).json(mangaDetails);
    } catch (error) {
      console.error("Erro ao buscar os detalhes do mangá:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar os detalhes do mangá" });
    }
  }
);
router.get(
  "/manga/:name/:chapter/read",
  async (req: Request, res: Response) => {
    const { name, chapter } = req.params;

    const mangaDetails = await scrapeMangaReadingPage(
      `https://mangananquim.site/ler-manga/${name}/${chapter}/?style=list`
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
      `https://mangananquim.site/ler-manga/${name}`,
      name
    );
    if (!mangaEpisodesWithTitle) {
      return res.status(204).send();
    }
    return res.status(200).json(mangaEpisodesWithTitle);
  }
);

export default router;
