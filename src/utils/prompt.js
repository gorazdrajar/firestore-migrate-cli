module.exports = {
  text,
  select,
  bool,
  file,
};

const colors = require("colors/safe");

function text(question) {
  return askQuestion(colors.cyan(question));
}

function bool(question) {
  const answer = askQuestion(colors.cyan(question + " (Y/n)"));
  if (answer === "N" || answer == "n") {
    return false;
  }
  return true;
}

function select(question, options) {
  let fullQuestion = colors.cyan(question);
  options.forEach((option, i) => {
    fullQuestion += colors.gray(`\n(${i + 1}) ${option}`);
  });
  const answer = askQuestion(fullQuestion);
  let selectedIndex;
  try {
    selectedIndex = parseInt(answer) - 1;
    if (!(selectedIndex < options.length && selectedIndex >= 0))
      throw new Error("Invalid user input");
  } catch (err) {
    console.log(colors.red(`Invalid entry '${answer}', please enter a valid number.`));
    return select(question, options);
  }
  return selectedIndex;
}

function file(question, format) {
  const fileUtils = require("./files");
  const path = askQuestion(colors.cyan(question + "\n" + colors.white(process.cwd())));
  return fileUtils.readFile(path, format);
}

// Non-exported helpers

function askQuestion(question) {
  const readline = require("readline-sync");
  return readline.question("\n" + question + "\n> ");
}
