import React from "react";

export default function DeckCreationForm({ appendDeck }) {
  function enterDecklist(formData) {
    const data = Object.fromEntries(formData);
    console.log(data.deckname);

    const currentDeck = {
      name: data.deckname,
      created: Date.now(),
      winrate: Math.random(),
      gamesPlayed: 13,
    };

    appendDeck(currentDeck);
  }
  return (
    <form action={enterDecklist}>
      <label>Deck Name:</label>
      <input type="text" id="deckname" name="deckname"></input>
      <button>Submit</button>
    </form>
  );
}
