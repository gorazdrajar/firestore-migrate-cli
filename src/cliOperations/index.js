module.exports = runCli;
const prompt = require("../utils/prompt");
const colors = require("colors");

function runCli() {
  intro();
  return chooseOperation()
    .then(() => {
      console.log("All done, exiting.");
      process.exit();
    })
    .catch(err => {
      console.log(colors.red("An error occured: " + err));
    });
}

function chooseOperation() {
  const operations = [
    `${colors.white("Dump")} Firestore collections`,
    `${colors.white("Deploy")} dump to Firestore`,
  ];
  const selectedIndex = prompt.select("What will you have me do?", operations);
  if (selectedIndex == 0) {
    const dump = require("./dump");
    return dump();
  } else if (selectedIndex == 1) {
    const deploy = require("./deploy");
    return deploy();
  }
  return chooseOperation();
}

function intro() {
  console.log(
    colors.bgWhite(`
###################################
#     `) +
      colors.bgWhite(colors.cyan("Firestore Migrate CLI")) +
      colors.bgWhite(
        `       #
###################################`
      )
  );
}
