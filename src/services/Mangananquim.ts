import axios from "axios";
import cheerio from "cheerio";
import puppeteer from "puppeteer";
import { randomUUID } from "node:crypto";

interface Manga {
  id: string;
  name: string;
  rating: number;
  lastChapter: string;
  date: string;
  cover: string;
  identifier: string;
}

interface LatestManga {
  id: string;
  name: string;
  identifier: string;
  rating: number;
  lastChapter: string;
  date: string;
  cover: string;
}

interface MangaDetails {
  id: string;
  title: string;
  image: string;
  rating: number;
  alternative: string;
  author: string;
  artist: string;
  genres: string[];
  type: string;
  tags: string[];
  releaseYear: string;
  status: string;
  summary: string;
  episodes: Episode[];
}

interface Episode {
  title: string;
  link: string;
  releaseDate: string;
}

interface MangaReading {
  title: string;
  images: string[];
}

export async function scrapeGeralMangaPage(
  url: string
): Promise<Manga[] | null> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const mangas: Manga[] = [];

    $(".page-item-detail.manga").each((i, element) => {
      const mangaURL = $(element).find(".item-thumb a").attr("href");
      const identifier = mangaURL
        ? mangaURL.split("/ler-manga/")[1].split("/")[0]
        : "";

      const name = $(element).find(".post-title a").text();
      const rating = parseFloat(
        $(element).find(".meta-item.rating .post-total-rating .score").text()
      );
      const lastChapter = $(element)
        .find(".list-chapter .chapter-item:first-child .chapter a")
        .text()
        .trim();
      const cover = $(element).find(".item-thumb a img").attr("src") as string;
      const date = $(element)
        .find(".list-chapter .chapter-item:first-child .post-on")
        .text()
        .trim();

      mangas.push({
        id: randomUUID(),
        name,
        rating,
        lastChapter,
        date,
        cover,
        identifier,
      });
    });

    return mangas.length > 0 ? mangas : null;
  } catch (error) {
    return null;
  }
}

export async function scrapTrendingeMangaPage(
  url: string
): Promise<Manga[] | null> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const mangas: Manga[] = [];

    $(".page-item-detail.manga").each((i, element) => {
      const mangaURL = $(element).find(".item-thumb a").attr("href");
      const identifier = mangaURL
        ? mangaURL.split("/ler-manga/")[1].split("/")[0]
        : "";

      const name = $(element).find(".post-title a").text();
      const rating = parseFloat(
        $(element).find(".meta-item.rating .post-total-rating .score").text()
      );
      const lastChapter = $(element)
        .find(".list-chapter .chapter-item:first-child .chapter a")
        .text()
        .trim();
      const cover = $(element).find(".item-thumb a img").attr("src") as string;
      const date = $(element)
        .find(".list-chapter .chapter-item:first-child .post-on")
        .text()
        .trim();

      mangas.push({
        id: randomUUID(),
        name,
        rating,
        lastChapter,
        date,
        cover,
        identifier,
      });
    });

    return mangas.length > 0 ? mangas : null;
  } catch (error) {
    return null;
  }
}

export async function scrapeLatestMangaPage(
  url: string
): Promise<LatestManga[] | null> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const latestMangas: LatestManga[] = [];

    $(".page-item-detail").each((i, element) => {
      const mangaURL = $(element).find(".item-thumb a").attr("href");
      const identifier = mangaURL
        ? mangaURL.split("/ler-manga/")[1].split("/")[0]
        : "";

      const name = $(element).find(".post-title a").text();
      const rating = parseFloat(
        $(element).find(".post-total-rating .score").text()
      );
      const lastChapter = $(element)
        .find(".list-chapter .chapter-item:first-child .chapter a")
        .text();
      const cover = $(element).find(".item-thumb a img").attr("src") as any;
      const date = $(element)
        .find(".list-chapter .chapter-item:first-child .post-on")
        .text()
        .trim();

      latestMangas.push({
        id: randomUUID(),
        identifier,
        name,
        rating,
        lastChapter,
        date,
        cover,
      });
    });

    return latestMangas.length > 0 ? latestMangas : null;
  } catch (error) {
    return null;
  }
}

export async function scrapeMangaDetailsPage(
  url: string
): Promise<MangaDetails | null> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $(".post-title h1").text().trim();
    const image = $(".summary_image a img").attr("src") as any;
    const rating = parseFloat($(".post-total-rating .score").text());
    const alternative = $('.summary-content:contains("Alternative")')
      .next()
      .text()
      .trim();
    const author = $(".author-content a").text();
    const artist = $(".artist-content a").text();
    const genres = $(".genres-content a")
      .map((i, el) => $(el).text())
      .get();
    const type = $('.summary-content:contains("Type")').next().text().trim();
    const tags = $(".tags-content a")
      .map((i, el) => $(el).text())
      .get();
    const releaseYear = $(
      '.post-content_item:contains("Release") .summary-content'
    )
      .text()
      .trim();
    const status = $('.post-content_item:contains("Status") .summary-content')
      .text()
      .trim();
    const summary = $(".description-summary .summary__content p").text().trim();

    const browser = await puppeteer.launch({
      args: ["--disable-setuid-sandbox", "--no-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();

    // Desativar o download de imagens e CSS
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        req.resourceType() === "stylesheet" ||
        req.resourceType() === "font" ||
        req.resourceType() === "image"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: "networkidle0" });

    const episodes = await page.evaluate(() => {
      const episodeElements = document.querySelectorAll(
        "ul.main.version-chap li.wp-manga-chapter"
      );
      let episodeList: Episode[] = [];

      episodeElements.forEach((element) => {
        const title = (
          element.querySelector("a") as HTMLElement
        )?.innerText.trim();
        const link = (element.querySelector("a") as HTMLAnchorElement)?.href;
        const releaseDate = (
          element.querySelector(".chapter-release-date i") as HTMLElement
        )?.innerText.trim();

        if (title && link && releaseDate) {
          episodeList.push({ title, link, releaseDate });
        }
      });

      // Filtrar episódios que têm "_1" no link
      episodeList = episodeList.filter(
        (episode) => !episode.link.includes("_1")
      );

      return episodeList;
    });

    await browser.close();

    return episodes.length > 0
      ? {
          id: randomUUID(),
          title,
          image,
          rating,
          alternative,
          author,
          artist,
          genres,
          type,
          tags,
          releaseYear,
          status,
          summary,
          episodes,
        }
      : null;
  } catch (error) {
    return null;
  }
}

export async function scrapeMangaReadingPage(
  url: string
): Promise<MangaReading | null> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $("#chapter-heading").text().trim();
    const images: string[] = [];

    $(".page-break img").each((i, elem) => {
      const imgUrl = $(elem).attr("src")?.trim();
      if (imgUrl) {
        images.push(imgUrl);
      }
    });

    return images.length > 0 ? { title, images } : null;
  } catch (error) {
    return null;
  }
}

export async function scrapeMangaTitleEpisodesPage(
  url: string,
  name: string
): Promise<any | null> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $(".post-title h1").text().trim();

    const browser = await puppeteer.launch({
      args: ["--disable-setuid-sandbox", "--no-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();

    // Desativar o download de imagens e CSS
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        req.resourceType() === "stylesheet" ||
        req.resourceType() === "font" ||
        req.resourceType() === "image"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: "networkidle0" });

    const episodes = await page.evaluate(() => {
      const episodeElements = document.querySelectorAll(
        "ul.main.version-chap li.wp-manga-chapter"
      );
      const episodeList: Episode[] = [];

      episodeElements.forEach((element) => {
        const title = (
          element.querySelector("a") as HTMLElement
        )?.innerText.trim();
        const link = (element.querySelector("a") as HTMLAnchorElement)?.href;
        const releaseDate = (
          element.querySelector(".chapter-release-date i") as HTMLElement
        )?.innerText.trim();

        if (title && link && releaseDate) {
          episodeList.push({ title, link, releaseDate });
        }
      });

      return episodeList;
    });

    await browser.close();

    return episodes.length > 0
      ? {
          id: name,
          title,
          episodes,
        }
      : null;
  } catch (error) {
    return null;
  }
}
