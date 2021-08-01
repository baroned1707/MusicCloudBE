const path = require("path");
const edge = require("selenium-webdriver/edge");
const driverEdge = path.join(__dirname.replace("\\config", "") + "\\driver") + "\\msedgedriver.exe";
const service = new edge.ServiceBuilder(driverEdge);
const edegOption = new edge.Options();
// edegOption.addArguments("headless");

module.exports = {
  service,
  edegOption,
};
