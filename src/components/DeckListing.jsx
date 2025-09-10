import React from "react";

export default function DeckListing({ deckLists }) {
  const sortedArray = [...deckLists];
  const [sortDirection, setSortDirection] = React.useState(
    () => sortByWinrateAsc
  );

  sortedArray.sort(sortDirection);

  return (
    <>
      <div>
        <button onClick={() => setSortDirection((prev) => sortByWinrateAsc)}>
          Asc
        </button>
        <button onClick={() => setSortDirection((prev) => sortByWinrateDesc)}>
          Desc
        </button>
      </div>
      <div className="deckGrid">
        {sortedArray.map((deck, index) => (
          <Card key={index} deck={deck} />
        ))}
      </div>
    </>
  );
}

function Card({ deck }) {
  return (
    <div className="deckCard">
      <h1>
        {deck.name}
        <br />
        Winrate: {Number(deck.winrate * 100).toFixed(2)}%
      </h1>
    </div>
  );
}

const sortByWinrateAsc = (a, b) => a.winrate - b.winrate;
const sortByWinrateDesc = (a, b) => b.winrate - a.winrate;
