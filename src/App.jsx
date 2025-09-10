import React from "react";

import "./App.css";
import DeckCreationForm from "./components/DeckCreationForm";
import DeckListing from "./components/DeckListing";

import { getDatabase, ref, onValue, push, set } from "firebase/database";

const sampleDeck = {
  name: "Venusaur Ex",
  created: Date.now(),
  winrate: 0.78,
  gamesPlayed: 13,
};

const initialData = [sampleDeck];

function App() {
  const [deckLists, setDecklists] = React.useState([]);

  React.useEffect(() => {
    listenToDB((databaseData) => setDecklists(databaseData));
  }, []);

  function resetDecks() {
    setDecklists([]);
    // localStorage.setItem("decks", "[]");
  }

  function appendDeck(newDeck) {
    const updated = [...deckLists, newDeck];
    // setDecklists(updated);
    // localStorage.setItem("decks", JSON.stringify(updated));
    saveDecklist(updated);
    console.log("New Deck added: " + newDeck);
  }

  return (
    <>
      <DeckCreationForm appendDeck={appendDeck} />

      <DeckListing deckLists={deckLists} />
      <button onClick={resetDecks}>Reset</button>
    </>
  );
}

function listenToDB(updateData) {
  const db = getDatabase();
  const decksRef = ref(db, "/decks");
  onValue(decksRef, (snapshot) => {
    const data = snapshot.val();
    updateData(data);
  });
}

// UNUSED - SINGLE DECK
// function saveDeck(deck) {
//   const db = getDatabase();
//   // get the length of the array
//   push(ref(db, "/decks"), deck);
// }

function saveDecklist(deckList) {
  const db = getDatabase();
  // get the length of the array
  set(ref(db, "/decks"), deckList);
}

export default App;
