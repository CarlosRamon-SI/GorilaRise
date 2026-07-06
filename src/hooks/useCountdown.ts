import { useState, useEffect, useRef } from 'react';
import { useTimerSound } from './useTimerSound';

export const useCountdown = () => {
  const [time, setTime] = useState(0);
  const [originalTime, setOriginalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playStartSound, playEndSound } = useTimerSound();
  // Refs to avoid stale closures without adding to deps
  const playEndSoundRef = useRef(playEndSound);
  playEndSoundRef.current = playEndSound;

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          playEndSoundRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]); // apenas isRunning — não recriar o intervalo a cada tick

  const start = () => {
    if (time === 0) {
      const totalSeconds = minutes * 60 + seconds;
      setTime(totalSeconds);
      setOriginalTime(totalSeconds);
    }
    setIsRunning(true);
    playStartSound();
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return {
    time,
    originalTime,
    isRunning,
    minutes,
    seconds,
    setMinutes,
    setSeconds,
    start,
    pause,
    reset,
  };
};
