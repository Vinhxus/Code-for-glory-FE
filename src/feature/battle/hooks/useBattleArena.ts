import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBattleById, submitAnswer } from '../services/battleService';
import {
  getBattleSocket,
  disconnectBattleSocket,
} from '../services/battleSocket';
import type { Battle, OpponentCorrectPayload } from '../types/battle.types';
import { BATTLE_ROUTES } from '../constants/battle.constants';
import { useAuth } from '../../auth/useAuth';

const CORRECT_FEEDBACK_DELAY_MS = 1200;

export const useBattleArena = (battleId: string | undefined) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('// Write your answer here\n');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    isCorrect: boolean;
    message: string;
    points: number;
  } | null>(null);

  // Theo dõi mounted state để chặn setState sau khi unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  // Fetch battle ban đầu
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

        // Chỉ set tạm timeLimit, timer-tick từ server sẽ cập nhật chính xác ngay sau đó
        if (data.status === 'IN_PROGRESS') {
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

  // Socket: join room battle + lắng nghe realtime events
  useEffect(() => {
    if (!battleId) return;

    const socket = getBattleSocket();
    socket.connect();
    socket.emit('join-battle', { battleId });

    const handleBattleStarted = (updatedBattle: Battle) => {
      setBattle(updatedBattle);
      setTimeLeft(updatedBattle.timeLimit);
    };

    const handleOpponentCorrect = (payload: OpponentCorrectPayload) => {
      setBattle((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.userId === payload.userId
              ? { ...p, currentScore: payload.currentScore }
              : p
          ),
        };
      });
    };

    const handleTimerTick = (payload: { timeRemaining: number }) => {
      setTimeLeft(payload.timeRemaining);
    };

    // Nguồn navigate DUY NHẤT khi trận đấu kết thúc (dù do hết giờ hay
    // do 1 trong 2 người đúng hết câu) — delay bằng feedback delay để
    // cả 2 người chơi đều kịp thấy trạng thái cuối trước khi bị chuyển trang.
    const handleBattleEnded = () => {
      setTimeout(() => {
        if (isMountedRef.current) {
          navigate(`${BATTLE_ROUTES.RESULT}/${battleId}`);
        }
      }, CORRECT_FEEDBACK_DELAY_MS);
    };

    socket.on('battle-started', handleBattleStarted);
    socket.on('opponent-correct', handleOpponentCorrect);
    socket.on('timer-tick', handleTimerTick);
    socket.on('battle-ended', handleBattleEnded);

    return () => {
      socket.off('battle-started', handleBattleStarted);
      socket.off('opponent-correct', handleOpponentCorrect);
      socket.off('timer-tick', handleTimerTick);
      socket.off('battle-ended', handleBattleEnded);
      disconnectBattleSocket();
    };
  }, [battleId, navigate]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const myUserId = user?.id ?? '';
  const me = battle?.players.find((p) => p.userId === myUserId) ?? null;
  const opponent = battle?.players.find((p) => p.userId !== myUserId) ?? null;

  const handleSubmit = async (language: string) => {
    if (!battle || !battleId || isSubmitting) return;

    const currentQuestion = battle.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setIsSubmitting(true);
    setSubmitResult(null);
    localStorage.setItem(
      `battleLang:${battleId}:${currentQuestion.questionId}`,
      language
    );

    try {
      const result = await submitAnswer(battleId, {
        questionId: currentQuestion.questionId,
        answer: code,
      });

      if (!isMountedRef.current) return;

      setSubmitResult({
        isCorrect: result.isCorrect,
        message: result.message,
        points: result.points,
      });

      if (result.isCorrect) {
        const nextIndex = currentQuestionIndex + 1;
        advanceTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;

          // Nếu còn câu tiếp theo → chuyển câu cục bộ.
          // Nếu đây là câu cuối → KHÔNG tự navigate nữa, chờ
          // socket 'battle-ended' xử lý (xem effect Socket phía trên).
          if (nextIndex < battle.questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setCode('// Write your answer here\n');
            setSubmitResult(null);
          }
        }, CORRECT_FEEDBACK_DELAY_MS);
      }
    } catch {
      if (isMountedRef.current) {
        setSubmitResult({
          isCorrect: false,
          message: 'Submit failed. Please try again.',
          points: 0,
        });
      }
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  const dismissFeedback = () => setSubmitResult(null);

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
    dismissFeedback,
    isWaiting,
  };
};
