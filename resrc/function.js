const createUniqueID = () => {
  var time = new Date();
  var UniqueID = "";
  for (var i = 0; i < 10; i++) {
    var code = Math.floor(Math.random() * (90 - 65) + 65);
    UniqueID += String.fromCharCode(code);
  }
  UniqueID += String(time.getTime());
  return UniqueID;
};

const fixTextSpaceAndLine = (string) => {
  var temp = String(string);
  temp = temp.replaceAll("\n", "");
  temp = temp.trim();
  return temp;
};

module.exports = {
  createUniqueID,
  fixTextSpaceAndLine,
};
