
import { useState, useEffect } from "react";

const quotes = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
  { quote: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
];

export function useQuotes(intervalMinutes = 5) {
  const [quote, setQuote] = useState(quotes[0]);
  
  useEffect(() => {
    // Initial random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
    
    // Change quote at interval
    const intervalMs = intervalMinutes * 60 * 1000;
    const interval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[newIndex]);
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [intervalMinutes]);
  
  return quote;
}
