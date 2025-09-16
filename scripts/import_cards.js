import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter,
} from "firebase-admin/firestore";

import serviceAccount from "./key.json" with {type : "json"} ;

import  fs  from "fs";
import { json } from "stream/consumers";

import path from "path"

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const STATUS_FILE = "./upload_status.json";

function loadStatus() {
  return fs.existsSync(STATUS_FILE) // check if file exists, returns true or false.
  ? JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"))
  : {};
}

function saveStatus(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}




// DATABASE 
async function getFilenames() {
  const directory = "../card_data/cards/en/"
  const cardFiles = fs.readdirSync(directory)
  for (const filename of cardFiles) {
    
    const setName = path.parse(filename).name // extracts the name of the file (without .json) to use as setName

    if (filename.endsWith(".json")) {

      const uploadStatuses = loadStatus();
      let uploadedSuccess = false;

      if (Object.keys(uploadStatuses).length === 0) {
        console.log("EMPTY STATUS FOUND STARTING IMPORT")
        uploadedSuccess = await importSet(directory + filename, setName)
      } else {
        if (uploadStatuses[setName] && uploadStatuses[setName].uploaded) {
          console.log(`Skipping ${setName}, already uploaded!`);
        } else {
          uploadedSuccess = await importSet(directory + filename, setName); // if set not uploaded import the set to the database (this also does cards)
        }
      }

      // CHECK FOR UPLOAD SUCCESS
      if (uploadedSuccess) {
        uploadStatuses[setName] = {
          uploaded: true,
          lastUploaded : new Date().toISOString()
        };
        saveStatus(uploadStatuses)
        console.log(`${setName} uploaded successfully, updating upload_status.json`)
      }
    }
  }
}

async function importSet(filename, setName) {
  const allCards = await import(filename, {with: {type: "json"}})  // allCards [card0,card1]

  // UNCOMMENT BLOCK TO ENABLE LIVE DATABASE WRITES
  // const setRef = db.collection('card_data').doc(setName)
  // await setRef.set({}); 

  for (const cardObject of allCards.default) {
    // await addDataToDatabase(setName, cardObject.id, cardObject)
    return uploadBatch(filename, setName)
  }
}

// async function addDataToDatabase(setID, cardID, cardData) {
//   // UNCOMMENT BLOCK TO ENABLE LIVE DATABASE WRITES
//   // const cardRef = db.collection('card_data').doc(setID).collection('cards').doc(cardID);
//   // console.log(`ADDED: card_data/${setID}/cards/${cardID}`)
//   // await cardRef.set(cardData);
  
//   const outputCardData = setID + cardID;
//   fs.writeFileSync("test_output.txt", outputCardData, "utf8")
//   // console.log(`Wrote CARD ${outputCardData}`)
//   console.log(`Wrote SET ${setID}`)

// }

// // const snapshot = await db.collection("sv1").get();
// // snapshot.forEach((doc) => {
// //   console.log(doc.id, "=>", doc.data());
// // });


async function uploadBatch(filename, setName) {
  try {

    const allCards = await import(filename, {with: {type: "json"}})  // allCards [card0,card1]

    // Get a new write batch
    const batch = db.batch();

    for (const cardObject of allCards.default) {
      const cardRef = db.collection('card_data').doc(setName).collection('cards').doc(cardObject.id);
      batch.set(cardRef, cardObject) 
      console.log(`Added ${cardObject.id} to the batch.`)
      
    }
  
  // Commit the batch
  await batch.commit();
  console.log("upload complete");
  return true;

  } catch (error) {
    console.log("Batch upload failed!", error);
    return false;
  }  
}


getFilenames()