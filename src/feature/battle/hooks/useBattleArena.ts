import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBattleById } from '../services/battleService';
import type { Battle } from '../types/battle.types';
import { BATTLE_ROUTES } from '../constants/battle.constants';
import { submitAnswer } from '../services/battleService';

export const useBattleArena = (battleId: string | undefined) => {
  const navigate = useNavigate();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('// Write your answer here\n');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    isCorrect: boolean;
    message: string;
    points: number;
  } | null>(null);
  const [language, setLanguage] = useState('javascript');
  const [editorTheme, setEditorTheme] = useState('vs-dark');

  useEffect(() => {
    if (!battleId) {
      navigate(BATTLE_ROUTES.FIELD);
      return;
    }

    const fetchBattle = async () => {
      setIsLoading(true);
      try {
        const data = await getBattleById(battleId);
        setBattle(data);

        if (data.status === 'IN_PROGRESS' && data.expectedEndTime) {
          const remaining = Math.floor(
            (new Date(data.expectedEndTime).getTime() - Date.now()) / 1000
          );
          setTimeLeft(Math.max(0, remaining));
        } else if (data.status === 'IN_PROGRESS') {
          setTimeLeft(data.timeLimit);
        }
      } catch {
        setError('Failed to load battle. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBattle();
  }, [battleId, navigate]);
  //Timer countdown
  useEffect(() => {
    if (!battle || battle.status != 'IN_PROGRESS' || timeLeft <= 0) return;

    timeRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeRef.current!);
          navigate(`${BATTLE_ROUTES.RESULT}/${battle._id}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, [battle, navigate]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const mockUserId = localStorage.getItem('mockUserId') ?? '';
  const me = battle?.players.find((p) => p.userId === mockUserId) ?? null;
  const opponent = battle?.players.find((p) => p.userId !== mockUserId) ?? null;

  const handleSubmit = async () => {
    if (!battle || !battleId || isSubmitting) return;

    const currentQuestion = battle.questions[currentQuestionIndex];

    if (!currentQuestion) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await submitAnswer(battleId, {
        questionId: currentQuestion.questionId,
        answer: code,
      });
      setSubmitResult({
        isCorrect: result.isCorrect,
        message: result.message,
        points: result.points,
      });

      if (result.isCorrect) {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex >= battle.questions.length) {
          navigate(`${BATTLE_ROUTES.RESULT}/${battle._id}`);
        } else {
          setCurrentQuestionIndex(nextIndex);
          setCode('// Write your answer here\n');
          setSubmitResult(null);
        }
      }
    } catch {
      setSubmitResult({
        isCorrect: false,
        message: 'Submit failed. Please try again.',
        points: 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const isWaiting = battle?.status === 'WAITING';

  return {
    battle,
    isLoading,
    error,
    timeLeft,
    formatTime,
    me,
    opponent,
    currentQuestionIndex,
    code,
    setCode,
    isSubmitting,
    submitResult,
    handleSubmit,
    isWaiting,
  };
};
