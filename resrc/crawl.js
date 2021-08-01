const { service, edegOption } = require("../config/selenium");
const { Builder } = require("selenium-webdriver");
const { fixTextSpaceAndLine } = require("./function");
const albums = require("../temp/data.json");
var url = require("url");
const { query } = require("express");

const handleCrawlPlayList = async (req, res, next) => {
  const data = [];
  const driver = new Builder().forBrowser("MicrosoftEdge").setEdgeService(service).setEdgeOptions(edegOption).build();
  try {
    await driver.get("https://www.youtube.com/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ/featured");
    const buttons = await driver.findElements({
      css: "div#right-arrow.style-scope.yt-horizontal-list-renderer > ytd-button-renderer > a > yt-icon-button > button.style-scope.yt-icon-button",
    });
    for (var i = 0; i < buttons.length; i++) {
      try {
        while (1) {
          await buttons[i].click();
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (e) {
        // console.log(`Button ${i} Error`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    var result = await driver.findElements({ css: "ytd-compact-station-renderer.style-scope.yt-horizontal-list-renderer > div" });
    for (var i = 0; i < result.length; i++) {
      var playList = await result[i].findElement({ css: "ytd-thumbnail > a" });
      var content = await result[i].findElement({ css: "a.yt-simple-endpoint.style-scope.ytd-compact-station-renderer" });
      //
      var playListLink = await playList.getAttribute("href");
      var thumbnail = await playList.findElement({ css: "yt-img-shadow > img" }).getAttribute("src");
      //
      var title = await content.findElement({ css: "h3" }).getAttribute("innerHTML");
      var description = await content.findElement({ css: "div > p#description" }).getAttribute("innerHTML");
      var numberOfSongs = await content.findElement({ css: "p#video-count-text" }).getAttribute("innerHTML");

      title = await fixTextSpaceAndLine(title);
      description = await fixTextSpaceAndLine(description);
      numberOfSongs = await fixTextSpaceAndLine(numberOfSongs);

      data.push({
        thumbnail,
        playListLink,
        title,
        description,
        numberOfSongs,
      });
    }

    driver.close();
    await res.send({
      status: true,
      data: data,
    });
  } catch (e) {
    driver.close();
    await res.send({
      status: false,
      data: e.message,
    });
  }
};

const handleCrawlTrackList = async (req, res, next) => {
  const driver = new Builder().forBrowser("MicrosoftEdge").setEdgeService(service).setEdgeOptions(edegOption).build();
  try {
    var data = [];

    for (var i = 0; i < albums.length; i++) {
      var cur = albums[i];
      cur.trackList = [];
      await driver.get(cur.playListLink);
      var container = await driver.findElement({ css: "div#items.playlist-items.style-scope.ytd-playlist-panel-renderer" });
      var elements = await container.findElements({ css: "ytd-playlist-panel-video-renderer" });
      for (var j = 0; j < elements.length; j++) {
        await driver.executeScript("arguments[0].scrollIntoView()", elements[j]);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      elements = await container.findElements({ css: "ytd-playlist-panel-video-renderer" });
      for (var j = 0; j < elements.length; j++) {
        var thumbnail = await elements[j]
          .findElement({
            css: "a#wc-endpoint > div#container > div#thumbnail-container > ytd-thumbnail > a#thumbnail > yt-img-shadow > img",
          })
          .getAttribute("src");
        var content = await elements[j].findElement({ css: "a#wc-endpoint > div#container > div#meta" });
        var title = await content.findElement({ css: "h4 > span#video-title" }).getAttribute("title");
        var description = await content.findElement({ css: "div#byline-containerz > span#byline" }).getAttribute("innerHTML");
        var link = await elements[j].findElement({ css: "a#wc-endpoint" }).getAttribute("href");
        console.log(thumbnail);
        console.log(title);
        console.log(description);
        link = url.parse(link, true).query;
        console.log(link["v"]);
        cur.trackList.push({
          thumbnail,
          title,
          description,
          link: link["v"],
        });
      }
      data.push(cur);
    }

    await driver.close();
    await res.send({
      status: true,
      data: data,
    });
  } catch {
    driver.close();
    await res.send({
      status: false,
      data: e.message,
    });
  }
};

const handleSearch = async (req, res, next) => {
  const driver = new Builder().forBrowser("MicrosoftEdge").setEdgeService(service).setEdgeOptions(edegOption).build();
  try {
    var keywork = req.query.keywork;
    if (typeof keywork != "string") {
      await driver.quit();
      return next(new Error("404:Not found Keywork !"));
    }
    console.log(keywork);
    keywork = String(keywork);
    keywork = keywork.replaceAll(" ", "+");
    keywork = keywork.replaceAll("=", "");

    var data = [];
    var limit = 3;
    var linkSearch = "https://www.youtube.com/results?app=desktop&search_query=" + keywork;

    await driver.get(linkSearch);
    var elements = await driver.findElements({ css: "div#contents.style-scope.ytd-item-section-renderer > ytd-video-renderer" });

    for (var i = 0; i < elements.length; i++) {
      if (i <= limit) {
        await driver.executeScript("arguments[0].scrollIntoView()", elements[i]);
      } else {
        break;
      }
    }

    elements = await driver.findElements({ css: "div#contents.style-scope.ytd-item-section-renderer > ytd-video-renderer" });

    for (var i = 0; i < elements.length; i++) {
      if (i <= limit) {
        var thumbnail = await elements[i]
          .findElement({ css: "div#dismissible.style-scope.ytd-video-renderer > ytd-thumbnail > a > yt-img-shadow > img" })
          .getAttribute("src");
        var content = await elements[i].findElement({
          css: "div#dismissible.style-scope.ytd-video-renderer > div.text-wrapper.style-scope.ytd-video-renderer > div#meta > div#title-wrapper > h3 > a",
        });
        var description = await content.getAttribute("title");
        var title = await content.getAttribute("aria-label");
        var link = await content.getAttribute("href");
        link = url.parse(link, true).query;
        data.push({
          thumbnail,
          title,
          description,
          link: link["v"],
        });
      } else {
        break;
      }
    }

    await driver.quit();
    await res.send({
      status: true,
      data: data,
    });
  } catch (e) {
    await driver.quit();
    await res.send({
      status: false,
      data: e.message,
    });
  }
};

const handleAnalytist = async (req, res, next) => {
  var albumLength = albums.length;
  var trackLength = 0;
  var data = [];
  for (var i = 0; i < albums.length; i++) {
    trackLength += albums[i].trackList.length;
    data.push({
      name: albums[i].title,
      trackListLength: albums[i].trackList.length,
    });
  }
  return res.send({
    status: true,
    data: {
      albumLength,
      trackLength,
      details: data,
    },
  });
};

module.exports = {
  handleCrawlPlayList,
  handleCrawlTrackList,
  handleAnalytist,
  handleSearch,
};
