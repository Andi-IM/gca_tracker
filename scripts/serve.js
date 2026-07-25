const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { scrapeProfileUrl } = require("./profile-scraper");

const root = process.cwd();
const port = Number(process.env.PORT || 5199);
const host = process.env.HOST || "0.0.0.0";
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

const server = http.createServer(async (request, response) => {
  const parsedUrl = new URL(request.url, `http://127.0.0.1:${port}`);
  const requestedPath = parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname;

  if (requestedPath === "/api/scrape") {
    await handleScrapeApi(parsedUrl, response);
    return;
  }

  const filePath = path.join(root, requestedPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "content-type": contentTypes[path.extname(filePath)] || "text/plain; charset=utf-8" });
    response.end(content);
  });
});

async function handleScrapeApi(parsedUrl, response) {
  const profileUrl = parsedUrl.searchParams.get("url");

  if (!profileUrl || !profileUrl.startsWith("https://www.skills.google/public_profiles/")) {
    sendJson(response, 400, { error: "URL profil publik Skills Google tidak valid." });
    return;
  }

  try {
    sendJson(response, 200, await scrapeProfileUrl(profileUrl));
  } catch (error) {
    sendJson(response, 502, { error: formatScrapeError(error) });
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

function formatScrapeError(error) {
  const message = error instanceof Error ? error.message : "Scrape gagal.";

  if (message.includes("spawn EPERM")) {
    return "Playwright tidak bisa membuka Chrome dari proses server ini. Tutup server yang sedang berjalan, lalu jalankan npm start langsung dari terminal PowerShell biasa.";
  }

  if (message.includes("Executable doesn't exist") || message.includes("playwright install")) {
    return "Browser Playwright belum terpasang. Jalankan npx playwright install chromium, lalu ulangi npm start.";
  }

  return message;
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} sudah dipakai. Jalankan dengan PORT lain, misalnya: PORT=5200 npm start`);
    process.exit(1);
  }

  throw error;
});

server.listen(port, host, () => {
  console.log(`Arcade Tracker siap di http://${host}:${port}`);
  console.log("Halaman app dan scraper profil berjalan dalam satu server lokal.");
});
