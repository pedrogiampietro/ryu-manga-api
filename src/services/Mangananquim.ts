import axios from "axios";
import cheerio from "cheerio";
import puppeteer from "puppeteer";

interface Manga {
  name: string;
  rating: number;
  lastChapter: string;
  date: string;
}

interface LatestManga {
  name: string;
  rating: number;
  lastChapter: string;
  date: string;
}

interface MangaDetails {
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

export async function scrapeMangaPage(url: string): Promise<Manga[]> {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const mangas: Manga[] = [];

  $(".page-item-detail").each((i, element) => {
    const name = $(element).find(".post-title a").text();
    const rating = parseFloat(
      $(element).find(".post-total-rating .score").text()
    );
    const lastChapter = $(element)
      .find(".list-chapter .chapter-item:first-child .chapter a")
      .text()
      .trim();
    const date = $(element)
      .find(".list-chapter .chapter-item:first-child .post-on")
      .text()
      .trim();

    mangas.push({ name, rating, lastChapter, date });
  });

  return mangas;
}

export async function scrapeLatestMangaPage(
  url: string
): Promise<LatestManga[]> {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const latestMangas: LatestManga[] = [];

  $(".page-item-detail").each((i, element) => {
    const name = $(element).find(".post-title a").text();
    const rating = parseFloat(
      $(element).find(".post-total-rating .score").text()
    );
    const lastChapter = $(element)
      .find(".list-chapter .chapter-item:first-child .chapter a")
      .text();
    const date = $(element)
      .find(".list-chapter .chapter-item:first-child .post-on")
      .text()
      .trim();

    latestMangas.push({ name, rating, lastChapter, date });
  });

  return latestMangas;
}

export async function scrapeMangaDetailsPage(
  url: string
): Promise<MangaDetails> {
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

  // Use puppeteer to handle dynamic content
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
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

  return {
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
  };
}

export async function scrapeMangaReadingPage(
  url: string
): Promise<MangaReading> {
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

  return { title, images };
}