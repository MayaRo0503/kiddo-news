"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
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
  ArrowUp,
  Zap,
  Brain,
  GamepadIcon as GameController,
} from "lucide-react";
import Link from "next/link";

// Define TypeScript interfaces for Article and ChildProfile.
interface Article {
  _id: string;
  title: string;
  image?: string;
}

interface ChildProfile {
  _id: string;
  name: string;
  username: string;
  likedArticles: Article[];
  savedArticles: Article[];
  // ... additional fields if needed.
}

const KidsPage = () => {
  // State for the verified child's profile (fetched from /api/auth/child)
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // States for the games
  const [mathProblem, setMathProblem] = useState({
    num1: 0,
    num2: 0,
    operator: "+",
  });
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathFeedback, setMathFeedback] = useState("");
  const [wordScramble, setWordScramble] = useState({
    original: "",
    scrambled: "",
  });
  const [wordGuess, setWordGuess] = useState("");
  const [wordFeedback, setWordFeedback] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [playApplause, setPlayApplause] = useState(false);

  // States for Memory Cards game
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [matched, setMatched] = useState<boolean[]>([]);

  // Fetch the child's profile once the component mounts.
  useEffect(() => {
    const fetchChildProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("/api/auth/child", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setChild(data.child);
        } else {
          console.error("Error fetching child profile:", data.error);
        }
      } catch (error) {
        console.error("Error fetching child profile:", error);
      }
    };
    fetchChildProfile();
  }, []);

  // Math challenge functions
  const generateMathProblem = useCallback(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ["+", "-", "x"];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    setMathProblem({ num1, num2, operator });
    setMathAnswer("");
    setMathFeedback("");
  }, []);

  const checkMathAnswer = useCallback(() => {
    let correctAnswer;
    switch (mathProblem.operator) {
      case "+":
        correctAnswer = mathProblem.num1 + mathProblem.num2;
        break;
      case "-":
        correctAnswer = mathProblem.num1 - mathProblem.num2;
        break;
      case "x":
        correctAnswer = mathProblem.num1 * mathProblem.num2;
        break;
      default:
        correctAnswer = 0;
    }
    if (Number.parseInt(mathAnswer) === correctAnswer) {
      setMathFeedback("Correct! You're a math wizard! 🎉");
      setPlayApplause(true);
      setTimeout(() => setPlayApplause(false), 3000);
    } else {
      setMathFeedback("Oops! Try again. You can do it! 💪");
    }
  }, [mathProblem, mathAnswer]);

  // Word scramble functions
  const generateWordScramble = useCallback(() => {
    const words = ["RAINBOW", "BUTTERFLY", "ELEPHANT", "DINOSAUR", "SPACESHIP"];
    const word = words[Math.floor(Math.random() * words.length)];
    const scrambled = word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
    setWordScramble({ original: word, scrambled });
    setWordGuess("");
    setWordFeedback("");
  }, []);

  const checkWordGuess = useCallback(() => {
    if (wordGuess.toUpperCase() === wordScramble.original) {
      setWordFeedback("Amazing! You unscrambled the word! 🌟");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      setWordFeedback("Not quite. Keep trying, you're close! 🔍");
    }
  }, [wordGuess, wordScramble]);

  // Memory Cards click handler
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
    // Use min-h-screen and overflow-y-auto to enable vertical scrolling.
    // Also wrap content in a max-width container (max-w-6xl) centered on the page.
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-indigo-400 via-purple-500 to-pink-500 p-4 md:p-8 max-w-8xl mx-auto">
      {showConfetti && <ReactConfetti />}
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-white text-center mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Saved Articles 🎈
      </motion.h1>

      {/* Games Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Math Challenge */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4 bg-gradient-to-br from-yellow-200 to-orange-300 shadow-lg">
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <Zap className="mr-2" /> Math Challenge
            </h2>
            <p className="mb-3 text-lg">Solve this math problem:</p>
            <p className="text-2xl font-bold mb-3">
              {`${mathProblem.num1} ${mathProblem.operator} ${mathProblem.num2} = ?`}
            </p>
            <input
              type="number"
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              className="w-full p-2 mb-3 text-lg text-center rounded"
              placeholder="Your answer"
            />
            <Button onClick={checkMathAnswer} className="w-full mb-3">
              Check Answer
            </Button>
            <AnimatePresence>
              {mathFeedback && (
                <motion.p
                  className="text-lg text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {mathFeedback}
                </motion.p>
              )}
            </AnimatePresence>
            <Button onClick={generateMathProblem} className="w-full mt-3">
              New Problem
            </Button>
          </Card>
        </motion.div>

        {/* Word Scramble */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-200 to-blue-300 shadow-lg">
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <Brain className="mr-2" /> Word Scramble
            </h2>
            <p className="mb-3 text-lg">Unscramble this word:</p>
            <p className="text-2xl font-bold mb-3">{wordScramble.scrambled}</p>
            <input
              type="text"
              value={wordGuess}
              onChange={(e) => setWordGuess(e.target.value)}
              className="w-full p-2 mb-3 text-lg text-center rounded"
              placeholder="Your guess"
            />
            <Button onClick={checkWordGuess} className="w-full mb-3">
              Check Guess
            </Button>
            <AnimatePresence>
              {wordFeedback && (
                <motion.p
                  className="text-lg text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {wordFeedback}
                </motion.p>
              )}
            </AnimatePresence>
            <Button onClick={generateWordScramble} className="w-full mt-3">
              New Word
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Saved Articles Section */}
      {child && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mt-6 p-4 bg-gradient-to-br from-blue-200 to-purple-300 shadow-lg">
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <Book className="mr-2" /> Saved Articles
            </h2>
            {child.savedArticles.length === 0 ? (
              <p className="text-muted-foreground text-center">
                No saved articles yet! Bookmark articles to read them later.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {child.savedArticles.map((article) => (
                  <motion.div
                    key={article._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden transform transition-transform hover:scale-105">
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
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      <footer className="mt-6 text-center text-white">
        <p className="flex items-center justify-center">
          <Smile className="mr-2" /> Have fun and keep learning!
        </p>
      </footer>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4"
          >
            <Button
              className="rounded-full p-2"
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <ArrowUp />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidsPage;
