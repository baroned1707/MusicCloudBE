const { handeGetTrack } = require("../controller/track");
const { handleCrawlPlayList, handleCrawlTrackList, handleAnalytist, handleSearch } = require("../resrc/crawl");
const router = require("express").Router();

router.get("/gettrack", async (req, res, next) => {
  try {
    await handeGetTrack(req, res, next);
  } catch (e) {
    next(new Error(`400:${e.message}`));
  }
});

router.get("/crawlplaylist", async (req, res, next) => {
  try {
    await handleCrawlPlayList(req, res, next);
  } catch (e) {
    next(new Error(`400:${e.message}`));
  }
});

router.get("/crawltracklist", async (req, res, next) => {
  try {
    await handleCrawlTrackList(req, res, next);
  } catch (e) {
    next(new Error(`400:${e.message}`));
  }
});

router.get("/analytist", async (req, res, next) => {
  try {
    await handleAnalytist(req, res, next);
  } catch (e) {
    next(new Error(`400:${e.message}`));
  }
});

router.get("/search", async (req, res, next) => {
  try {
    await handleSearch(req, res, next);
  } catch (e) {
    next(new Error(`400:${e.message}`));
  }
});

module.exports = router;
