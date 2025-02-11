"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Smile,
  Book,
  GamepadIcon as GameController,
  ArrowUp,
} from "lucide-react";
import Link from "next/link";

interface Article {
  _id: string;
  title: string;
  image?: string;
  // You can add other fields if needed (like a summary) for the article.
}

interface ChildProfile {
  name: string;
  username: string;
  likedArticles: Article[];
  savedArticles: Article[];
  // Other fields can be added as needed
  // e.g., timeLimit, remainingTime, birthDate, etc.
}

const KidsPage = () => {
  // State to hold the child's profile data
  const [child, setChild] = useState<ChildProfile | null>(null);
  // States for games (Guess the Number, Memory Cards)
  const [guessNumber, setGuessNumber] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [secretNumber] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [matched, setMatched] = useState<boolean[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch the child's profile using the token from localStorage
  useEffect(() => {
    const fetchChildProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("/api/auth/child", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          // data.child should include likedArticles and savedArticles as arrays of objects with _id and title.
          setChild(data.child);
        } else {
          console.error("Error fetching child profile");
        }
      } catch (error) {
        console.error("Error fetching child profile:", error);
      }
    };
    fetchChildProfile();
  }, []);

  // Initialize Memory Cards game and scroll event listener
  useEffect(() => {
    const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
    const shuffledCards = [...emojis, ...emojis].sort(
      () => Math.random() - 0.5
    );
    setCards(shuffledCards);
    setFlipped(new Array(16).fill(false));
    setMatched(new Array(16).fill(false));
    const handleScroll = () => {
      setShowScrollTop(document.documentElement.scrollTop > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGuess = () => {
    if (guessNumber === null) return;
    if (guessNumber === secretNumber) {
      setFeedback("Yay! You guessed it right! 🎉");
    } else if (guessNumber < secretNumber) {
      setFeedback("Try a higher number! ⬆️");
    } else {
      setFeedback("Try a lower number! ⬇️");
    }
  };

  const handleCardClick = (index: number) => {
    if (flipped[index] || matched[index]) return;
    const newFlipped = [...flipped];
    newFlipped[index] = true;
    setFlipped(newFlipped);

    const flippedCards = newFlipped.reduce(
      (acc, curr, idx) => (curr && !matched[idx] ? [...acc, idx] : acc),
      [] as number[]
    );

    if (flippedCards.length === 2) {
      if (cards[flippedCards[0]] === cards[flippedCards[1]]) {
        const newMatched = [...matched];
        newMatched[flippedCards[0]] = true;
        newMatched[flippedCards[1]] = true;
        setMatched(newMatched);
      } else {
        setTimeout(() => {
          const resetFlipped = [...newFlipped];
          resetFlipped[flippedCards[0]] = false;
          resetFlipped[flippedCards[1]] = false;
          setFlipped(resetFlipped);
        }, 1000);
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    // Ensure the container is scrollable with min-h-screen and overflow-y-auto.
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-indigo-400 via-purple-500 to-pink-500 p-4 md:p-8 max-w-8xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
        Likes Articles 🎈
      </h1>

      {/* Games Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guess the Number */}
        <Card className="p-4 bg-yellow-200">
          <h2 className="text-xl font-bold mb-3 flex items-center">
            <GameController className="mr-2" /> Guess the Number
          </h2>
          <p className="mb-3">
            I'm thinking of a number between 1 and 10. Can you guess it?
          </p>
          <input
            type="number"
            min="1"
            max="10"
            value={guessNumber ?? ""}
            onChange={(e) => setGuessNumber(Number.parseInt(e.target.value))}
            className="w-full p-2 mb-3 text-lg text-center"
            aria-label="Enter your guess"
          />
          <Button onClick={handleGuess} className="w-full mb-3">
            Guess!
          </Button>
          <p className="text-lg text-center">{feedback}</p>
        </Card>

        {/* Memory Cards */}
        <Card className="p-4 bg-green-200">
          <h2 className="text-xl font-bold mb-3 flex items-center">
            <GameController className="mr-2" /> Memory Cards
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card, index) => (
              <Button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`h-12 text-xl ${
                  flipped[index] || matched[index] ? "" : "bg-blue-500"
                }`}
                aria-label={`Card ${index + 1}`}
              >
                {flipped[index] || matched[index] ? card : "?"}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Articles Section */}
      {child && (
        <>
          {/* Articles You Liked */}
          <Card className="mt-6 p-4 bg-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="mr-2" />
                <span className="text-xl font-bold text-blue-800">
                  Articles You Liked
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {child.likedArticles.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  No liked articles yet! Start exploring and like the ones you
                  enjoy.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {child.likedArticles.map((article) => (
                    <Card
                      key={article._id}
                      className="overflow-hidden shadow-lg"
                    >
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-24 object-cover"
                      />
                      <CardContent className="p-3">
                        <h3 className="text-base font-semibold text-gray-800">
                          {article.title}
                        </h3>
                        <Button className="mt-2 text-sm" variant="outline">
                          Read More
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <footer className="mt-6 text-center text-white">
        <p className="flex items-center justify-center">
          <Smile className="mr-2" /> Have fun and keep learning!
        </p>
      </footer>

      {showScrollTop && (
        <Button
          className="fixed bottom-4 right-4 rounded-full p-2"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp />
        </Button>
      )}
    </div>
  );
};

export default KidsPage;
