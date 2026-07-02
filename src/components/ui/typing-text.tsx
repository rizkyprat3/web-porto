"use client";

/**
 * Typing subtitle: cycles through phrases, typing and deleting each.
 * Renders plain text (no layout shift — reserved height via min-h on parent).
 */
import { useEffect, useState } from "react";

interface TypingTextProps {
  phrases: string[];
  typingSpeedMs?: number;
  deletingSpeedMs?: number;
  pauseMs?: number;
  className?: string;
}

export function TypingText({
  phrases,
  typingSpeedMs = 55,
  deletingSpeedMs = 28,
  pauseMs = 1800,
  className,
}: TypingTextProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];
    let delay = deleting ? deletingSpeedMs : typingSpeedMs;

    if (!deleting && text === current) delay = pauseMs; // full phrase → pause
    if (deleting && text === "") delay = 300; // empty → brief beat before next

    const timer = setTimeout(() => {
      if (!deleting) {
        if (text === current) {
          setDeleting(true);
        } else {
          setText(current.slice(0, text.length + 1));
        }
      } else {
        if (text === "") {
          setDeleting(false);
          setPhraseIndex((i) => (i + 1) % phrases.length);
        } else {
          setText(current.slice(0, text.length - 1));
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, phraseIndex, phrases, typingSpeedMs, deletingSpeedMs, pauseMs]);

  return (
    <span className={className} aria-label={phrases.join(", ")}>
      {text}
      <span aria-hidden className="animate-caret text-neon-cyan">▍</span>
    </span>
  );
}
