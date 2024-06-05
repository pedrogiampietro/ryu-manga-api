import axios from "axios";
import cheerio from "cheerio";

interface Manga {
  id: string;
  name: string;
  lastChapter: string;
  date: string;
  cover: string;
  identifier: string;
}

interface Episode {
  title: string;
  link: string;
  releaseDate: string;
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

interface MangaReading {
  title: string;
  images: string[];
}

export const scrapTrendingeMangaPage = async (
  url: string
): Promise<Manga[]> => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const mangas: Manga[] = [];

  $(".popular-item-wrap").each((i, elem) => {
    const name = $(elem).find(".widget-title a").attr("title") || "";
    const cover = $(elem).find(".popular-img img").attr("src") || "";
    const lastChapter = $(elem)
      .find(".chapter-item:first-child .chapter a")
      .text()
      .trim();
    const link = $(elem).find(".widget-title a").attr("href") || "";
    const id = cover.split("/").pop()?.split("-").slice(0, -1).join("-") || "";
    const date = $(elem)
      .find(".chapter-item:first-child .post-on")
      .text()
      .trim();

    mangas.push({
      id,
      name,
      lastChapter,
      date,
      cover,
      identifier: id,
    });
  });

  return mangas;
};

export const scrapeMangaDetailsPage = async (
  url: string
): Promise<MangaDetails> => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $(".post-title h1").text().trim();
  const alternative = $(
    ".post-content_item:contains('Nome alternativo') .summary-content"
  )
    .text()
    .trim();
  const artist = $(
    ".post-content_item:contains('Artista(s)') .summary-content a"
  )
    .map((i, elem) => $(elem).text())
    .get();
  const genres = $(
    ".post-content_item:contains('Gênero(s)') .summary-content a"
  )
    .map((i, elem) => $(elem).text())
    .get();
  const type = $(".post-content_item:contains('Tipo') .summary-content")
    .text()
    .trim();
  const releaseYear = $(
    ".post-content_item:contains('Lançamento') .summary-content a"
  )
    .text()
    .trim();
  const status = $(".post-content_item:contains('Status') .summary-content")
    .text()
    .trim();
  const rating = parseFloat($(".post-total-rating .score").text());
  const image = $(".summary_image img").attr("src") as string;
  const summary = $(".manga-excerpt p").text().trim();

  const idMatch = url.match(/manga\/([^/]+)/);
  const id = idMatch ? idMatch[1] : "";

  const episodes: Episode[] = [];
  $(".wp-manga-chapter").each((i, elem) => {
    const title = $(elem).find("a").text().trim();
    const releaseDate = $(elem).find(".chapter-release-date i").text().trim();
    const link = $(elem).find("a").attr("href") || "";
    episodes.push({ title, releaseDate, link });
  });

  return {
    id,
    title,
    image,
    rating,
    alternative,
    author: artist.join(", "),
    artist: artist.join(", "),
    genres,
    type,
    tags: genres,
    releaseYear,
    status,
    summary,
    episodes,
  };
};

export const scrapeMangaReadingPage = async (
  url: string
): Promise<MangaReading> => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $(".c-blog-post .entry-header").attr("data-chapter") as string;
  const images: string[] = [];

  $(".reading-content .page-break img").each((i, elem) => {
    const imgUrl = $(elem).attr("src")?.trim();
    if (imgUrl) {
      images.push(imgUrl);
    }
  });

  return { title, images };
};

export const scrapeMangaTitleEpisodesPage = async (
  url: string
): Promise<any> => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $(".post-title h1").text().trim();
    const idMatch = url.match(/manga\/([^/]+)/);
    const id = idMatch ? idMatch[1] : "";

    const episodes: Episode[] = [];
    $(".wp-manga-chapter").each((i, elem) => {
      const title = $(elem).find("a").text().trim();
      const releaseDate = $(elem).find(".chapter-release-date i").text().trim();
      const link = $(elem).find("a").attr("href") || "";
      episodes.push({ title, releaseDate, link });
    });

    return {
      id,
      title,
      episodes,
    };
  } catch (error) {
    return null;
  }
};
