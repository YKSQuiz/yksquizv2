
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  cursorClassName?: string;
}

const AnimatedTitle: FC<AnimatedTitleProps> = ({
  text,
  className,
  typingSpeed = 120, // Default speed, can be overridden by prop
  cursorClassName = "inline-block"
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);
    setShowCursor(true); // Reset cursor visibility on text change
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [text, typingSpeed]);

  useEffect(() => {
    if (isTypingComplete) {
      // Hide cursor once typing is complete
      const hideTimer = setTimeout(() => {
        setShowCursor(false);
      }, 150); // Slight delay to allow opacity transition
      return () => clearTimeout(hideTimer);
    }
    // For initial render or while typing, ensure cursor is visible if not yet complete
    // This part is mostly handled by the initial state and the typing effect itself
    // No explicit blinking logic needed here if cursor hides post-completion
  }, [isTypingComplete]);

  return (
    <h1 className={className}>
      {displayedText}
      {/* Cursor will fade out due to opacity transition when showCursor becomes false */}
      <span
        className={`${cursorClassName} transition-opacity duration-150 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
        style={{ fontKerning: 'none' }}
      >
        |
      </span>
    </h1>
  );
};

export default AnimatedTitle;
