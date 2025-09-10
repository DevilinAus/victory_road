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
    // clear the set name
    const setName = path.parse(filename).name

    if (filename.endsWith(".json")) {
      // console.log(directory + filename)
      /////////////////////////////////////////////////
      //========== CHECK STATUS =======================

      const status = loadStatus();

      if (status[setName].uploaded) {
        console.log(`Skipping ${setName}, already uploaded!`);
      } else {
        await importSet("filepath", setName)
      }


      //. Need to look at returning a true or false and either printing error or printing success 
      // and updating STATUS_FILE


      //////////////////////////////////////////////////
      /// THIS NEEDS TO BE UPDATED TO HANDLE A BATCH OF THE FULL SET
      await importSet(directory + filename, setName)
    }
    
  }
}

// /card_data/sv1/cards/sv1-1
async function importSet(filename, setName) {
  const allCards = await import(filename, {with: {type: "json"}})  // allCards [card0,card1]
  // console.log(typeof allCards)

  const setRef = db.collection('card_data').doc(setName)
  await setRef.set({}); 

  for (const cardObject of allCards.default) {
    await addDataToDatabase(setName, cardObject.id, cardObject)
  }
}

async function addDataToDatabase(setID, cardID, cardData) {
  const cardRef = db.collection('card_data').doc(setID).collection('cards').doc(cardID);
  console.log(`ADDED: card_data/${setID}/cards/${cardID}`)
  await cardRef.set(cardData);
  

}

// const snapshot = await db.collection("sv1").get();
// snapshot.forEach((doc) => {
//   console.log(doc.id, "=>", doc.data());
// });


getFilenames()