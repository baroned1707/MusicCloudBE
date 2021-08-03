// const path = require("path");
// const webdriver = require("selenium-webdriver");
// const { Builder } = require("selenium-webdriver");
// const edge = require("selenium-webdriver/edge");
// const pathEdgeDriver = path.join(__dirname.replace("\\config", "") + "\\driver") + "\\msedgedriver.exe";
// const service = new edge.ServiceBuilder(pathEdgeDriver);
// const edegOption = new edge.Options();
// edegOption.addArguments("headless");

// const driverEdge = new Builder().forBrowser("MicrosoftEdge").setEdgeService(service).setEdgeOptions(edegOption).build();

//chorme

const chrome = require("selenium-webdriver/chrome");

let options = new chrome.Options();
//Below arguments are critical for Heroku deployment
options.addArguments("--headless");
options.addArguments("--disable-gpu");
options.addArguments("--no-sandbox");

let driverChormeHeroku = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

module.exports = {
  driver: driverChormeHeroku,
};
