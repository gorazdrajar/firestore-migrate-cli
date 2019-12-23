# Firestore Migrate CLI

*Firestore Migrate CLI* is a NodeJS based CLI tool used for dumping Firestore collections into JSON files, and uploading such JSON files back to Firestore.

## Installation

You need to have [NodeJS](https://nodejs.org/en/) version 8.13.0 or higher installed before you can use the *Firestore Migrate CLI*.

Clone the Firestore Migrate CLI from git:

`git clone https://github.com/gorazdrajar/firestore-migrate-cli.git`

Install dependencies: 

`yarn` or `npm install`

You then need to configure the tool for usage with your Firebase projects. The tool allows multiple Firebase projects to be configured at the same time, which makes migrations from one Firebase project to another easier.

### Configuring service accounts

To allow *Firestore Migrate CLI* to read from and write to your Firestore instances, you need to give it admin access through the *Firebase service account*.

To download the service account key, open [Firebase Console](https://console.firebase.google.com) and go to *Settings* (⚙) -> *Users and Permissions* -> *Service accounts* and click on "Generate new private key". Firebase will generate a new key and your browser will automatically download the JSON file. Copy this file into the `/serviceAccounts/` folder in the root of the Firestore Migrate CLI tool. You can copy multiple *Service Account* files (of multiple Firebase projects) into `/serviceAccounts/` and the tool will recognize all valid ones.

### Setting the Firestore database URL

You also need to enter the Firestore database URL into the `/config/databaseURL.json` for each Firebase project you are using. 
There is an example file waiting for you there. 

```
{
  "your-firebase-project-id": {
    "databaseURL": "https://[firestore-id].firebaseio.com"
  },
  "the-other-firebase-project-id": {
    "databaseURL": "https://[the-other-firestore-id].firebaseio.com"
  },
  ...
}
```

Replace the object keys with your Firebase Project Ids. You can see the Project ID in the project settings in the [Firebase Console](https://console.firebase.google.com). Replace the database ids in the object values with the Firestore ids. You can see your Firestore ID in the Firestore section of the  [Firebase Console](https://console.firebase.google.com).

You can add more or remove all but one project. Generally, the number of databaseURLs should be equal to the number of the in previous step imported *Service Accounts*.

## Usage

Run the tool with Node:

```
cd path_to_cli
node .
```

The tool will offer 2 options for you - `(1) Dump` and `(2) Deploy`. 

The wizard will then guide you through the process of dumping or uploading a dump file. 

When choosing the *dump* option, the dumps are saved into the `/exports/` folder.