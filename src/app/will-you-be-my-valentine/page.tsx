"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";

export default function Page() {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [showHeart, setShowHeart] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const yesButtonSize = noCount * 20 + 16;
  
  // Make the "No" button run away when mouse hovers over it
  const handleNoButtonHover = () => {
    if (noCount > 0) {
      const newX = Math.random() * 200 - 100;
      const newY = Math.random() * 200 - 100;
      setNoButtonPosition({ x: newX, y: newY });
    }
  };

  const handleNoClick = () => {
    setNoCount(noCount + 1);
    // Change button position each time No is clicked
    const newX = Math.random() * 300 - 150;
    const newY = Math.random() * 300 - 150;
    setNoButtonPosition({ x: newX, y: newY });

    // Show broken heart animation at higher levels
    if (noCount > 5) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }
  };

  const handleYesClick = () => {
    setYesPressed(true);
    // Release confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Play sound effect
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3");
      audio.play();
    } catch (e) {
      console.log("Failed to play audio");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Will you be my Valentine?',
        url: 'https://mewtrucard.com/will-you-be-my-valentine/',
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Share API
      navigator.clipboard.writeText('https://mewtrucard.com/will-you-be-my-valentine/')
        .then(() => {
          setShareTooltip(true);
          setTimeout(() => setShareTooltip(false), 2000);
        })
        .catch((error) => console.log('Error copying to clipboard:', error));
    }
  };

  const getNoButtonText = () => {
    const phrases = [
      "No",
      "Are you sure?",
      "Really sure?",
      "Think again!",
      "Last chance!",
      "Surely not?",
      "You might regret this!",
      "Give it another thought!",
      "Are you absolutely certain?",
      "This could be a mistake!",
      "Have a heart!",
      "Don't be so cold!",
      "Change of heart?",
      "Wouldn't you reconsider?",
      "Is that your final answer?",
      "You're breaking my heart ;(",
    ];

    return phrases[Math.min(noCount, phrases.length - 1)];
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen -mt-16 overflow-hidden">
      {yesPressed ? (
        <>
          <img src="https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif" alt="Bear kiss" className="h-[200px] sm:h-[300px] animate-bounce" />
          <div className="text-2xl sm:text-4xl font-bold my-4 text-pink-600 animate-pulse">Ok yay!!!</div>
          <div className="mt-4 text-xl text-center">
            <p>Thank you for accepting my invitation! ❤️</p>
            <p className="mt-2 text-pink-500">You&apos;re my favorite!</p>
          </div>
          <div className="mt-8 flex items-center space-x-4 relative">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 underline">
              Back to Home
            </Link>
            <span className="text-gray-400">|</span>
            <button 
              onClick={handleShare} 
              className="text-sm text-pink-500 hover:text-pink-700 underline flex items-center"
            >
              Share
            </button>
            {shareTooltip && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                Link copied!
              </div>
            )}
          </div>
          <div className="absolute bottom-4 text-xs text-gray-400">
            Inspired by <a href="https://mewtru.com/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 underline">@mewtru.com</a>
          </div>
        </>
      ) : (
        <>
          {showHeart && (
            <div className="absolute z-10 animate-ping">
              <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTNsaXhveTM3bnl3bWM1dGk2bnB5OHJienQwc2I5MGRncnlyejE1aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HU2sYgCZh3HiKnS/giphy.gif" alt="Broken heart" className="w-20 h-20" />
            </div>
          )}
          <img 
            className={`h-[150px] sm:h-[200px] ${noCount > 3 ? 'animate-pulse' : ''}`} 
            src="https://gifdb.com/images/high/cute-love-bear-roses-ou7zho5oosxnpo6k.gif" 
            alt="Love bear with roses" 
          />
          <h1 className={`text-2xl sm:text-4xl my-4 text-center px-4 font-bold ${noCount > 2 ? 'text-red-600' : 'text-pink-600'}`}>
            Will you be my Valentine?
          </h1>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all hover:scale-110 shadow-lg"
              style={{ fontSize: yesButtonSize }}
              onClick={handleYesClick}
            >
              Yes
            </button>
            <button
              onMouseEnter={handleNoButtonHover}
              onClick={handleNoClick}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all absolute"
              style={{ 
                transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px)`,
                opacity: noCount > 8 ? 0.7 : 1,
                scale: noCount > 5 ? 0.8 : 1
              }}
            >
              {noCount === 0 ? "No" : getNoButtonText()}
            </button>
          </div>
          {noCount > 7 && (
            <div className="mt-8 text-pink-600 text-xl animate-bounce">
              Just click &quot;Yes&quot; already, don&apos;t hesitate!
            </div>
          )}
        </>
      )}
    </div>
  );
}
