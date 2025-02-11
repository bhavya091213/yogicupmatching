import React, { useState, useEffect, useRef } from "react";
import "./MemoryMatchGame.css";

interface Card {
  id: number;
  src: string;
  flipped: boolean;
  matched: boolean;
  mismatched?: boolean;
}

const MemoryMatchGame: React.FC = () => {
  // List of image paths from the public folder
  const cardImages: string[] = [
    "/cardImages/basketball.png",
    "/cardImages/bronny.png",
    "/cardImages/hoop.png",
    "/cardImages/lebron.png",
    "/cardImages/monster.png",
    "/cardImages/shoes.png",
    "/cardImages/trophy.png",
    "/cardImages/water.png",
    "/cardImages/whistle.png",
    "/cardImages/yclogo.png",
  ];

  // Function to create an array of 20 card objects (each image appears twice)
  const initializeCards = (): Card[] => {
    let cards: Card[] = [];
    cardImages.forEach((img, index) => {
      const card1: Card = {
        id: index * 2,
        src: img,
        flipped: false,
        matched: false,
      };
      const card2: Card = {
        id: index * 2 + 1,
        src: img,
        flipped: false,
        matched: false,
      };
      cards.push(card1, card2);
    });

    // Shuffle the cards using Fisher-Yates algorithm.
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  };

  // State for the deck of cards and game logic
  const [cards, setCards] = useState<Card[]>(initializeCards());
  const [firstCard, setFirstCard] = useState<Card | null>(null);
  const [secondCard, setSecondCard] = useState<Card | null>(null);
  const [disableBoard, setDisableBoard] = useState<boolean>(false);

  // Timer state
  const [time, setTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Game win state: when all cards are matched.
  const [gameWon, setGameWon] = useState<boolean>(false);

  // Start the timer as soon as the first card is flipped.
  useEffect(() => {
    if (timerActive && !timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  // Check for game win: if every card is matched, stop the timer.
  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.matched)) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setGameWon(true);
    }
  }, [cards]);

  const handleCardClick = (card: Card) => {
    if (disableBoard) return;
    if (card.flipped || card.matched) return;

    // Start the timer on the very first move.
    if (!timerActive) {
      setTimerActive(true);
    }

    // Flip the selected card
    const flippedCard = { ...card, flipped: true };
    const newCards = cards.map((c) => (c.id === card.id ? flippedCard : c));
    setCards(newCards);

    if (!firstCard) {
      setFirstCard(flippedCard);
    } else if (!secondCard) {
      setSecondCard(flippedCard);
      setDisableBoard(true);

      // Check for a match
      if (firstCard.src === flippedCard.src) {
        // Correct match: mark both cards as matched.
        const updatedCards = newCards.map((c) => {
          if (c.src === firstCard.src) {
            return { ...c, matched: true };
          }
          return c;
        });
        setCards(updatedCards);
        resetTurn();
      } else {
        // Mismatch: simply flip the cards back after a short delay.
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) => {
              if (c.id === firstCard.id || c.id === flippedCard.id) {
                return { ...c, flipped: false };
              }
              return c;
            })
          );
          resetTurn();
        }, 1000);
      }
    }
  };

  const resetTurn = () => {
    setFirstCard(null);
    setSecondCard(null);
    setDisableBoard(false);
  };

  const resetGame = () => {
    // Refresh the browser to reset the game.
    window.location.reload();
  };

  return (
    <div className="game-container">
      <h1 className="game-title">SPEED TRAINING</h1>

      <div className={`grid-container ${gameWon ? "blur" : ""}`}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card 
              ${card.flipped ? "flipped" : ""} 
              ${card.matched ? "matched" : ""} 
              ${card.mismatched ? "mismatched" : ""}`}
            onClick={() => handleCardClick(card)}
          >
            <div className="card-inner">
              <div className="card-front">
                <img src={card.src} alt="card" />
              </div>
              <div className="card-back">
                <img src="/cardImages/altLogo.png" alt="card back" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="timer">Time: {time} seconds</div>
      {gameWon && (
        <div className="modal">
          <div className="modal-content">
            <h2>You win!</h2>
            <p>Your time: {time} seconds</p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;
