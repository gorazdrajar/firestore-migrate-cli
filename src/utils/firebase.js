const admin = require("firebase-admin");
const fileUtils = require("../utils/files");
const prompt = require("../utils/prompt");
const colors = require("colors");

module.exports = { chooseFirebaseProject };

function chooseFirebaseProject(forcePrompt = false) {
  //   if (admin.apps.length > 0 && !forcePrompt) {
  //   return admin.firestore();
  //   }
  return scanFirebaseCredentials()
    .then(serviceAccounts => {
      return setProject(serviceAccounts);
    })
    .then(() => admin.firestore());
}

function setProject(serviceAccounts) {
  const projectNames = serviceAccounts.map(serviceAccount => serviceAccount.project_id);
  const selectedIndex = prompt.select(`Which project do you want to use?`, projectNames);
  let serviceAccount = serviceAccounts[selectedIndex];
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `gs://${serviceAccount.project_id}.appspot.com`,
  });
  return true;
}

function scanFirebaseCredentials() {
  console.log("Scanning /serviceAccounts folder for service account files...");
  return fileUtils.readFolder(ROOT_DIR + "/serviceAccounts").then(serviceAccountFiles => {
    let readPromises = [];
    serviceAccounts = serviceAccountFiles.forEach(serviceAccountFile => {
      readPromises.push(readSingleServiceAccount(serviceAccountFile));
    });
    return Promise.all(readPromises)
      .then(serviceAccounts => {
        return serviceAccounts.filter(serviceAccount => !!serviceAccount);
      })
      .then(serviceAccounts => {
        if (!serviceAccounts.length)
          throw new Error(
            "No valid Firebase service accounts found. Please copy at least one service account JSON file into /serviceAccounts folder."
          );
        return serviceAccounts;
      });
  });
}

function readSingleServiceAccount(serviceAccountFile) {
  const serviceAccount = fileUtils.readFile("/serviceAccounts/" + serviceAccountFile, "json");
  if (serviceAccount && serviceAccount.project_id && serviceAccount.type == "service_account") {
    return serviceAccount;
  } else {
    console.log(
      colors.yellow(`Warning: '${serviceAccountFile}' is not a service account file, ignored.`)
    );
  }
}
