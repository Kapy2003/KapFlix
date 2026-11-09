import test from "node:test";
import assert from "node:assert/strict";

// Re-test the core stream resolution logic
function getStreamUrl({ type, id, season = 1, episode = 1, server = "vidlink" }) {
  const isMovie = type === "movie";
  const s = Math.max(1, Number(season) || 1);
  const e = Math.max(1, Number(episode) || 1);

  switch (server) {
    case "vidsrc":
      return isMovie
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`;
    case "embedsu":
      return isMovie
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s}/${e}`;
    case "multiembed":
      return isMovie
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`;
    case "vidlink":
    default:
      return isMovie
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${s}/${e}`;
  }
}

test("Stream URL generator for Movies", () => {
  assert.equal(
    getStreamUrl({ type: "movie", id: 550, server: "vidlink" }),
    "https://vidlink.pro/movie/550"
  );
  assert.equal(
    getStreamUrl({ type: "movie", id: 550, server: "vidsrc" }),
    "https://vidsrc.to/embed/movie/550"
  );
  assert.equal(
    getStreamUrl({ type: "movie", id: 550, server: "embedsu" }),
    "https://embed.su/embed/movie/550"
  );
  assert.equal(
    getStreamUrl({ type: "movie", id: 550, server: "multiembed" }),
    "https://multiembed.mov/?video_id=550&tmdb=1"
  );
});

test("Stream URL generator for TV Series with seasons and episodes", () => {
  assert.equal(
    getStreamUrl({ type: "tv", id: 1399, season: 2, episode: 5, server: "vidlink" }),
    "https://vidlink.pro/tv/1399/2/5"
  );
  assert.equal(
    getStreamUrl({ type: "tv", id: 1399, season: 2, episode: 5, server: "vidsrc" }),
    "https://vidsrc.to/embed/tv/1399/2/5"
  );
  assert.equal(
    getStreamUrl({ type: "tv", id: 1399, season: 2, episode: 5, server: "embedsu" }),
    "https://embed.su/embed/tv/1399/2/5"
  );
  assert.equal(
    getStreamUrl({ type: "tv", id: 1399, season: 2, episode: 5, server: "multiembed" }),
    "https://multiembed.mov/?video_id=1399&tmdb=1&s=2&e=5"
  );
});

test("Stream URL fallback to VidLink on unknown server", () => {
  assert.equal(
    getStreamUrl({ type: "movie", id: 100, server: "unknown" }),
    "https://vidlink.pro/movie/100"
  );
});

test("Production static server guards against path traversal", async () => {
  process.env.NODE_ENV = "test";
  const http = await import("node:http");
  const { server } = await import("../server.js");
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const status = await new Promise((resolve, reject) => {
      const req = http.request({ host: "localhost", port, path: "/../package.json" }, (res) => {
        resolve(res.statusCode);
      });
      req.on("error", reject);
      req.end();
    });
    assert.equal(status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("OTA version manifest is valid and contains release metadata", async () => {
  const fs = await import("node:fs");
  const raw = fs.readFileSync("./public/version.json", "utf-8");
  const data = JSON.parse(raw);

  assert.ok(data.version, "version string required");
  assert.ok(typeof data.build === "number", "build number required");
  assert.ok(data.apkUrl && data.apkUrl.endsWith(".apk"), "apkUrl must point to .apk file");
});
