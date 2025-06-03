
"use client";

import type { Question } from '@/lib/types';
import { ALL_QUESTIONS, EXAM_TYPES, SUBJECTS, TOPICS } from '@/lib/questions';
import { BADGES } from '@/lib/badges';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import TimerDisplay from './TimerDisplay';
import ScoreDisplay from './ScoreDisplay';
import XPBar from './XPBar';
import { AlertCircle, CheckCircle2, RotateCcw, XCircle, Star, Bolt, Award, Percent, Timer, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';


interface QuizPageContentProps {
  examType: string;
  subject: string;
  topic: string;
}

const TOTAL_QUIZ_TIME_SECONDS = 180; // 3 minutes
const MAX_QUESTIONS_PER_QUIZ = 10;

const XP_FOR_CORRECT_ANSWER = 10;
const XP_FOR_QUIZ_COMPLETION = 20; // Bonus XP for completing a quiz
const XP_PER_LEVEL = 250; // XP needed to advance one level

// Energy System constants
const INITIAL_ENERGY = 100;
const MAX_ENERGY = 100;
const ENERGY_COST_PER_ANSWER = 2; // Cost to submit an answer
const ENERGY_REGEN_INTERVAL_MINUTES = 10; // Regenerate every 10 minutes
const ENERGY_REGEN_AMOUNT = 5; // Amount of energy regenerated

// Badge System constants
const CONSECUTIVE_CORRECT_FOR_BADGE = 5;
const SUBJECTS_FOR_MYSTERY_BADGE = 3; // Number of unique subjects to complete for a badge


const calculateLevel = (xp: number | undefined): number => {
  if (xp === undefined || xp < 0) return 1;
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

// Helper function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface UserJokersFirestoreData {
  fiftyFifty?: boolean;
  extraTime?: boolean;
  secondChance?: boolean;
}

export default function QuizPageContent({ examType, subject, topic }: QuizPageContentProps) {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_QUIZ_TIME_SECONDS);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [currentUserXP, setCurrentUserXP] = useState<number>(0);
  const [currentUserLevel, setCurrentUserLevel] = useState<number>(1);
  const [currentUserEnergy, setCurrentUserEnergy] = useState<number>(INITIAL_ENERGY);
  const [consecutiveCorrectAnswers, setConsecutiveCorrectAnswers] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set());
  const [hasGivenFirstCorrectAnswer, setHasGivenFirstCorrectAnswer] = useState(false);
  const [completedSubjects, setCompletedSubjects] = useState<Set<string>>(new Set());

  // Joker States
  const [jokerFiftyFiftyAvailable, setJokerFiftyFiftyAvailable] = useState(true);
  const [jokerExtraTimeAvailable, setJokerExtraTimeAvailable] = useState(true);
  const [jokerSecondChanceAvailable, setJokerSecondChanceAvailable] = useState(true);

  const [jokerFiftyFiftyUsedThisQuiz, setJokerFiftyFiftyUsedThisQuiz] = useState(false);
  const [jokerExtraTimeUsedThisQuiz, setJokerExtraTimeUsedThisQuiz] = useState(false);
  const [jokerSecondChanceUsedThisQuiz, setJokerSecondChanceUsedThisQuiz] = useState(false);

  const [disabledOptionsByJoker, setDisabledOptionsByJoker] = useState<string[]>([]);
  const [secondChanceActive, setSecondChanceActive] = useState(false);
  const [firstAttemptMadeWithSecondChance, setFirstAttemptMadeWithSecondChance] = useState(false);


  const USER_STATS_SUMMARY_PATH = (uid: string) => `users/${uid}/stats/summary`;
  const USER_JOKERS_PATH = (uid: string) => `users/${uid}`;


  const updateUserStatsInFirestore = useCallback(async (updates: {
    totalTestsIncrement?: number;
    correctAnswersIncrement?: number;
    wrongAnswersIncrement?: number;
    xpIncrement?: number;
    lastQuizTitle?: string;
    currentLevel?: number; // This can be derived or passed
  }) => {
    if (!currentUser?.uid) return;

    const statsSummaryRef = doc(db, USER_STATS_SUMMARY_PATH(currentUser.uid));

    try {
      const docSnap = await getDoc(statsSummaryRef);
      let currentData = {
        totalTests: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        xp: 0,
        level: 1,
        lastQuizTitle: '',
        lastQuizDate: Timestamp.now(), // Default to now, will be updated
      };

      if (docSnap.exists()) {
        currentData = { ...currentData, ...docSnap.data() };
      }
      
      const newTotalTests = currentData.totalTests + (updates.totalTestsIncrement || 0);
      const newCorrectAnswers = currentData.correctAnswers + (updates.correctAnswersIncrement || 0);
      const newWrongAnswers = currentData.wrongAnswers + (updates.wrongAnswersIncrement || 0);
      const newXp = currentData.xp + (updates.xpIncrement || 0);
      const newLevel = calculateLevel(newXp); 

      const dataToSet = {
        totalTests: newTotalTests,
        correctAnswers: newCorrectAnswers,
        wrongAnswers: newWrongAnswers,
        xp: newXp,
        level: newLevel, 
        lastQuizTitle: updates.lastQuizTitle || currentData.lastQuizTitle,
        lastQuizDate: Timestamp.now(), 
      };

      await setDoc(statsSummaryRef, dataToSet, { merge: true });

      setCurrentUserXP(newXp); // Keep local state in sync
      setCurrentUserLevel(newLevel);

    } catch (error) {
      console.error("Error updating user stats in Firestore: ", error);
      toast({
        title: "Hata",
        description: "İstatistikleriniz güncellenirken bir sorun oluştu.",
        variant: "destructive",
      });
    }
  }, [currentUser?.uid, toast]);

  const updateJokerStatusInFirestore = useCallback(async (jokerName: keyof UserJokersFirestoreData, available: boolean) => {
    if (!currentUser?.uid) return;
    const userDocRef = doc(db, USER_JOKERS_PATH(currentUser.uid));
    try {
        await setDoc(userDocRef, { jokers: { [jokerName]: available } }, { merge: true });
    } catch (error) {
        console.error(`Error updating ${jokerName} joker status in Firestore: `, error);
        toast({
            title: "Joker Güncelleme Hatası",
            description: `${jokerName} jokeri güncellenemedi.`,
            variant: "destructive",
        });
    }
}, [currentUser?.uid, toast]);


  const regenerateEnergy = useCallback(() => {
    if (!currentUser?.uid) return INITIAL_ENERGY;
    const storedEnergy = localStorage.getItem(`quizWhizUserEnergy_${currentUser.uid}`);
    let currentEnergyVal = storedEnergy ? parseInt(storedEnergy, 10) : INITIAL_ENERGY;
    
    const lastUpdateStr = localStorage.getItem(`quizWhizLastEnergyUpdate_${currentUser.uid}`);
    const lastUpdateTime = lastUpdateStr ? parseInt(lastUpdateStr, 10) : Date.now();
    const now = Date.now();
    const minutesPassed = Math.floor((now - lastUpdateTime) / (1000 * 60));

    if (minutesPassed >= ENERGY_REGEN_INTERVAL_MINUTES) {
      const regenerationCycles = Math.floor(minutesPassed / ENERGY_REGEN_INTERVAL_MINUTES);
      const energyToRegenerate = regenerationCycles * ENERGY_REGEN_AMOUNT;
      currentEnergyVal = Math.min(MAX_ENERGY, currentEnergyVal + energyToRegenerate);
      localStorage.setItem(`quizWhizLastEnergyUpdate_${currentUser.uid}`, (lastUpdateTime + regenerationCycles * ENERGY_REGEN_INTERVAL_MINUTES * 60 * 1000).toString());
    }
    
    localStorage.setItem(`quizWhizUserEnergy_${currentUser.uid}`, currentEnergyVal.toString());
    setCurrentUserEnergy(currentEnergyVal);
    return currentEnergyVal;
  }, [currentUser?.uid]);


  const unlockBadgeAndNotify = useCallback((badgeId: string) => {
    if (currentUser?.uid && !unlockedBadges.has(badgeId)) {
      const newUnlockedBadges = new Set(unlockedBadges);
      newUnlockedBadges.add(badgeId);
      setUnlockedBadges(newUnlockedBadges);
      localStorage.setItem(`quizWhizUnlockedBadges_${currentUser.uid}`, JSON.stringify(Array.from(newUnlockedBadges)));

      const foundBadge = BADGES.find(b => b.id === badgeId); 
      if (foundBadge) {
        setTimeout(() => {
          toast({
            title: `🏅 Rozet Kazanıldı: ${foundBadge.name}!`,
            description: foundBadge.description,
            className: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400 dark:bg-yellow-400/10 dark:text-yellow-300 shadow-lg",
            duration: 7000,
            action: foundBadge.icon ? <foundBadge.icon className="text-yellow-500 dark:text-yellow-400 w-6 h-6" /> : <Award className="text-yellow-500 dark:text-yellow-400 w-6 h-6" />,
          });
        }, 700); 
      }
    }
  }, [unlockedBadges, toast, currentUser?.uid]);
  
  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }
    
    const fetchInitialUserData = async () => {
      try {
        const statsSummaryRef = doc(db, USER_STATS_SUMMARY_PATH(currentUser.uid));
        const statsDocSnap = await getDoc(statsSummaryRef);
        if (statsDocSnap.exists()) {
            const data = statsDocSnap.data();
            setCurrentUserXP(data.xp || 0);
            setCurrentUserLevel(data.level || 1);
        } else {
            setCurrentUserXP(0);
            setCurrentUserLevel(1);
        }

        const storedEnergy = localStorage.getItem(`quizWhizUserEnergy_${currentUser.uid}`);
        const initialEnergy = storedEnergy ? parseInt(storedEnergy, 10) : INITIAL_ENERGY;
        setCurrentUserEnergy(initialEnergy);
        if (!storedEnergy) localStorage.setItem(`quizWhizUserEnergy_${currentUser.uid}`, INITIAL_ENERGY.toString());
        
        const storedLastEnergyUpdate = localStorage.getItem(`quizWhizLastEnergyUpdate_${currentUser.uid}`);
        if (!storedLastEnergyUpdate) localStorage.setItem(`quizWhizLastEnergyUpdate_${currentUser.uid}`, Date.now().toString());
        
        regenerateEnergy(); 

        const storedUnlockedBadges = localStorage.getItem(`quizWhizUnlockedBadges_${currentUser.uid}`);
        setUnlockedBadges(storedUnlockedBadges ? new Set(JSON.parse(storedUnlockedBadges)) : new Set());
        
        const storedHasGivenFirstCorrect = localStorage.getItem(`quizWhizHasGivenFirstCorrectAnswer_${currentUser.uid}`);
        setHasGivenFirstCorrectAnswer(storedHasGivenFirstCorrect === 'true');
        
        const storedCompletedSubjects = localStorage.getItem(`quizWhizCompletedSubjects_${currentUser.uid}`);
        setCompletedSubjects(storedCompletedSubjects ? new Set(JSON.parse(storedCompletedSubjects)) : new Set());

      } catch (error) {
          console.error("Error fetching initial user data:", error);
          setError("Kullanıcı verileriniz yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.");
      }
    };

    fetchInitialUserData();
  }, [currentUser?.uid, regenerateEnergy]);


  const allQuestionsForTopic = useMemo(() => {
    return ALL_QUESTIONS.filter(
      (q) => q.examType === examType && q.subject === subject && q.topic === topic
    );
  }, [examType, subject, topic]);

  const resetQuizState = useCallback(async () => {
    // This function now focuses on resetting state, Firestore interaction for jokers happens before this if needed.
    // Caller (setupQuiz) will handle clearing global error and setting global loading states.
    try {
      if (currentUser?.uid) {
        const userJokersRef = doc(db, USER_JOKERS_PATH(currentUser.uid));
        let needsFirestoreUpdate = false;
        try {
            const jokerDocSnap = await getDoc(userJokersRef);
            const currentJokers = jokerDocSnap.exists() ? (jokerDocSnap.data()?.jokers as UserJokersFirestoreData) : null;

            if (!currentJokers || currentJokers.fiftyFifty === false || currentJokers.extraTime === false || currentJokers.secondChance === false) {
                needsFirestoreUpdate = true;
            }
            if (needsFirestoreUpdate) {
                await setDoc(userJokersRef, {
                    jokers: { fiftyFifty: true, extraTime: true, secondChance: true }
                }, { merge: true });
            }
        } catch (fsError: any) {
            console.error("Error resetting jokers in Firestore:", fsError);
            setError("Joker hakları sıfırlanırken bir hata oluştu: " + fsError.message);
            // Allow quiz to proceed even if joker reset fails, jokers might appear used.
        }
      }

      setJokerFiftyFiftyAvailable(true);
      setJokerExtraTimeAvailable(true);
      setJokerSecondChanceAvailable(true);
      setJokerFiftyFiftyUsedThisQuiz(false);
      setJokerExtraTimeUsedThisQuiz(false);
      setJokerSecondChanceUsedThisQuiz(false);
  
      const currentEnergyVal = regenerateEnergy(); // regenerateEnergy now also sets state
      const shuffledQuestions = shuffleArray(allQuestionsForTopic);
      const questionsForQuiz = shuffledQuestions.slice(0, MAX_QUESTIONS_PER_QUIZ);
  
      setQuestions(questionsForQuiz);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswerId(null);
      setShowFeedback(false);
      setIsCorrect(null);
      setQuizFinished(false);
      setTimeLeft(TOTAL_QUIZ_TIME_SECONDS);
      // setCurrentUserEnergy(currentEnergyVal); // Handled by regenerateEnergy
      setConsecutiveCorrectAnswers(0);
  
      setDisabledOptionsByJoker([]);
      setSecondChanceActive(false);
      setFirstAttemptMadeWithSecondChance(false);
      setQuizStartTime(Date.now());
      
    } catch (error: any) {
      console.error("Error in resetQuizState (non-Firestore part): ", error);
      setError("Quiz yeniden başlatılırken beklenmedik bir sorun oluştu.");
    }
  }, [currentUser?.uid, regenerateEnergy, allQuestionsForTopic, examType, subject, topic]);


  useEffect(() => {
    if (!currentUser?.uid || !examType || !subject || !topic) {
        setIsLoading(false); // Ensure loading is false if prerequisites are not met
        return;
    }

    const setupQuiz = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await resetQuizState();
      } catch (e: any) {
        console.error("Critical error during quiz setup (useEffect):", e);
        setError(`Quiz başlatılırken kritik bir hata oluştu: ${e.message || 'Bilinmeyen bir hata.'}`);
      } finally {
        setIsLoading(false); 
      }
    };

    setupQuiz();
  }, [examType, subject, topic, currentUser?.uid, resetQuizState]);


  useEffect(() => {
    setSelectedAnswerId(null);
    if (!jokerFiftyFiftyUsedThisQuiz) { 
        setDisabledOptionsByJoker([]);
    }
  }, [currentQuestionIndex, jokerFiftyFiftyUsedThisQuiz]);


  const showXPToast = useCallback((xpToAdd: number, reason: string) => {
    if (xpToAdd > 0) {
        const newTotalXP = currentUserXP + xpToAdd; // Calculate for display
        toast({
            title: reason === "Doğru Cevap" || reason === "Doğru Cevap (2. Hak)" ? <span className="text-accent dark:text-green-400">✅ {reason}!</span> : `🎉 ${reason}!`,
            description: `+${xpToAdd} XP kazandın! (Yeni Toplam: ${newTotalXP} XP)`,
            className: reason === "Doğru Cevap" || reason === "Doğru Cevap (2. Hak)" ? "border-accent bg-accent/10 text-accent-foreground dark:border-green-500 dark:bg-green-500/10 dark:text-green-300" : "border-primary bg-primary/10 text-primary-foreground dark:border-purple-500 dark:bg-purple-500/10 dark:text-purple-300",
            duration: 3000,
        });
        // Actual XP state update is handled by updateUserStatsInFirestore
    }
  }, [toast, currentUserXP]);

  const showLevelUpToast = useCallback((newLevel: number) => {
     setTimeout(() => {
        toast({
          title: `🌟 Seviye Atladın! 🌟`,
          description: `Tebrikler! Seviye ${newLevel} oldun. Bir sonraki seviye için ${XP_PER_LEVEL} XP daha gerekiyor.`,
          className: "border-primary bg-primary/10 text-primary-foreground dark:border-purple-500 dark:bg-purple-500/10 dark:text-purple-300 shadow-lg",
          duration: 7000,
          action: <Star className="text-yellow-400 dark:text-yellow-300 w-6 h-6" />,
        });
      }, 500);
  }, [toast]);


  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  useEffect(() => {
    if (isLoading || error || questions.length === 0 || quizFinished || !currentUser) return;

    if (timeLeft <= 0) {
      if (!quizFinished) { // Ensure this block runs only once
        setQuizFinished(true); // Set finished state first
        
        const exam = EXAM_TYPES.find(e => e.id === examType);
        const topicData = TOPICS.find(t => t.id === topic && t.subject === subject && t.examType === examType);
        const quizTitle = `${topicData?.name || 'Quiz'} (${exam?.name || examType})`;
        
        const oldLevel = currentUserLevel; // Use state that's updated by updateUserStatsInFirestore
        const xpEarnedInQuiz = XP_FOR_QUIZ_COMPLETION; // Only completion bonus if time runs out

        updateUserStatsInFirestore({
          xpIncrement: xpEarnedInQuiz,
          totalTestsIncrement: 1, 
          lastQuizTitle: quizTitle,
        }).then(() => {
            // updateUserStatsInFirestore now updates currentUserXP and currentUserLevel states
            // So, we can use those directly or re-calculate if needed for immediate toast.
            const newLevelAfterCompletion = calculateLevel(currentUserXP + xpEarnedInQuiz); // Re-calculate for toast based on change
             if (newLevelAfterCompletion > oldLevel) {
                showLevelUpToast(newLevelAfterCompletion);
            }
        });
        showXPToast(xpEarnedInQuiz, "Quiz Tamamlama Bonusu");


        if (currentUser?.uid) {
            const newCompletedSubjects = new Set(completedSubjects);
            newCompletedSubjects.add(subject);
            setCompletedSubjects(newCompletedSubjects);
            localStorage.setItem(`quizWhizCompletedSubjects_${currentUser.uid}`, JSON.stringify(Array.from(newCompletedSubjects)));
            if (newCompletedSubjects.size >= SUBJECTS_FOR_MYSTERY_BADGE) {
                unlockBadgeAndNotify('mystery-master');
            }
        }

        toast({
          title: "Süre Doldu!",
          description: "Quiz için ayrılan toplam süre bitti. İşte sonuçların.",
          variant: "destructive",
        });
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isLoading, error, questions, quizFinished, toast, currentUserXP, currentUserLevel, subject, completedSubjects, unlockBadgeAndNotify, examType, topic, currentUser, showXPToast, showLevelUpToast, updateUserStatsInFirestore]);

  const handleAnswerSelect = (answerId: string) => {
    if (!showFeedback) {
      setSelectedAnswerId(answerId);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswerId || !currentQuestion || !currentUser?.uid) {
      toast({
        title: "Cevap Seçilmedi",
        description: "Lütfen bir cevap seçin.",
        variant: "destructive",
      });
      return;
    }

    const currentEnergyVal = regenerateEnergy();
    if (currentEnergyVal < ENERGY_COST_PER_ANSWER && !secondChanceActive) { 
      toast({
        title: "Enerjin Bitti!",
        description: `Cevap göndermek için yeterli enerjin yok (${ENERGY_COST_PER_ANSWER} enerji gerekli). Enerjinin yenilenmesini bekle.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!secondChanceActive || (secondChanceActive && !firstAttemptMadeWithSecondChance)) { 
        const newEnergy = currentEnergyVal - ENERGY_COST_PER_ANSWER;
        setCurrentUserEnergy(newEnergy); // Update local state immediately
        localStorage.setItem(`quizWhizUserEnergy_${currentUser.uid}`, newEnergy.toString());
    }


    const correct = selectedAnswerId === currentQuestion.correctAnswerId;
    let xpChangeForThisAnswer = 0;
    const oldLevel = currentUserLevel;

    if (secondChanceActive) {
        if (!firstAttemptMadeWithSecondChance) { 
            setFirstAttemptMadeWithSecondChance(true);
            if (correct) {
                setSecondChanceActive(false); 
                setShowFeedback(true);
                setIsCorrect(true);
                setScore((prevScore) => prevScore + 1);
                xpChangeForThisAnswer = XP_FOR_CORRECT_ANSWER;
                
                updateUserStatsInFirestore({
                    xpIncrement: xpChangeForThisAnswer,
                    correctAnswersIncrement: 1,
                }).then(() => {
                    const newLevel = calculateLevel(currentUserXP + xpChangeForThisAnswer);
                    if (newLevel > oldLevel) showLevelUpToast(newLevel);
                });
                showXPToast(xpChangeForThisAnswer, "Doğru Cevap");
            } else {
                toast({
                    title: "Yanlış Cevap!",
                    description: "Çift cevap jokerin sayesinde bir hakkın daha var. Dikkatli seç!",
                    variant: "destructive",
                });
                setSelectedAnswerId(null); 
                setShowFeedback(false); 
                updateUserStatsInFirestore({ wrongAnswersIncrement: 1 }); 
                return; 
            }
        } else { 
            setSecondChanceActive(false); 
            setShowFeedback(true);
            setIsCorrect(correct);
            if (correct) {
                setScore((prevScore) => prevScore + 1);
                xpChangeForThisAnswer = XP_FOR_CORRECT_ANSWER;
                updateUserStatsInFirestore({
                    xpIncrement: xpChangeForThisAnswer,
                    correctAnswersIncrement: 1, 
                }).then(() => {
                    const newLevel = calculateLevel(currentUserXP + xpChangeForThisAnswer);
                     if (newLevel > oldLevel) showLevelUpToast(newLevel);
                });
                showXPToast(xpChangeForThisAnswer, "Doğru Cevap (2. Hak)");
            } else {
                toast({
                    title: <span className="text-shadow-destructive-title">❌ Yanlış Cevap</span>,
                    description: `Doğru cevap: ${currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswerId)?.text || ''}`,
                    variant: "destructive",
                });
                 updateUserStatsInFirestore({ wrongAnswersIncrement: 1 }); 
            }
        }
    } else { 
        setShowFeedback(true);
        setIsCorrect(correct);
        let correctIncrement = 0;
        let wrongIncrement = 0;

        if (correct) {
            setScore((prevScore) => prevScore + 1);
            xpChangeForThisAnswer += XP_FOR_CORRECT_ANSWER;
            correctIncrement = 1;
            setConsecutiveCorrectAnswers(prev => prev + 1);

            if (!hasGivenFirstCorrectAnswer) {
                unlockBadgeAndNotify('first-blood');
                setHasGivenFirstCorrectAnswer(true);
                localStorage.setItem(`quizWhizHasGivenFirstCorrectAnswer_${currentUser.uid}`, 'true');
            }
            if (consecutiveCorrectAnswers + 1 >= CONSECUTIVE_CORRECT_FOR_BADGE) {
                unlockBadgeAndNotify('serial-corrector');
            }
        } else {
            wrongIncrement = 1;
            setConsecutiveCorrectAnswers(0);
            toast({
                title: <span className="text-shadow-destructive-title">❌ Yanlış Cevap</span>,
                description: `Doğru cevap: ${currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswerId)?.text || ''}`,
                variant: "destructive",
            });
        }
        
        updateUserStatsInFirestore({
            xpIncrement: xpChangeForThisAnswer,
            correctAnswersIncrement: correctIncrement,
            wrongAnswersIncrement: wrongIncrement,
        }).then(() => {
            const newLevel = calculateLevel(currentUserXP + xpChangeForThisAnswer);
            if (newLevel > oldLevel) showLevelUpToast(newLevel);
        });
        if (correct) showXPToast(xpChangeForThisAnswer, "Doğru Cevap");

    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswerId(null); 
    setIsCorrect(null);
    regenerateEnergy(); 

    setDisabledOptionsByJoker([]);
    setSecondChanceActive(false);
    setFirstAttemptMadeWithSecondChance(false);


    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizFinished(true);
      
      const exam = EXAM_TYPES.find(e => e.id === examType);
      const topicData = TOPICS.find(t => t.id === topic && t.subject === subject && t.examType === examType);
      const quizTitle = `${topicData?.name || 'Quiz'} (${exam?.name || examType})`;
      const oldLevel = currentUserLevel;
      
      updateUserStatsInFirestore({
        xpIncrement: XP_FOR_QUIZ_COMPLETION,
        totalTestsIncrement: 1, 
        lastQuizTitle: quizTitle,
      }).then(() => {
          const newLevelAfterCompletion = calculateLevel(currentUserXP + XP_FOR_QUIZ_COMPLETION);
          if (newLevelAfterCompletion > oldLevel) {
              showLevelUpToast(newLevelAfterCompletion);
          }
      });
      showXPToast(XP_FOR_QUIZ_COMPLETION, "Quiz Tamamlama Bonusu");


      if (currentUser?.uid) {
        const timeTaken = (Date.now() - quizStartTime) / 1000; 
        if (timeTaken < TOTAL_QUIZ_TIME_SECONDS / 2 && score === questions.length) { // Also check if all answers were correct for speed badge
            unlockBadgeAndNotify('time-master');
        }

        const newCompletedSubjects = new Set(completedSubjects);
        newCompletedSubjects.add(subject); 
        setCompletedSubjects(newCompletedSubjects);
        localStorage.setItem(`quizWhizCompletedSubjects_${currentUser.uid}`, JSON.stringify(Array.from(newCompletedSubjects)));
        if (newCompletedSubjects.size >= SUBJECTS_FOR_MYSTERY_BADGE) {
            unlockBadgeAndNotify('mystery-master');
        }
      }
    }
  };

  // Joker Handler Functions
  const handleFiftyFiftyJoker = () => {
    if (!jokerFiftyFiftyAvailable || jokerFiftyFiftyUsedThisQuiz || !currentQuestion || showFeedback) return;

    setJokerFiftyFiftyUsedThisQuiz(true);
    updateJokerStatusInFirestore('fiftyFifty', false); 
    setJokerFiftyFiftyAvailable(false); 

    const incorrectOptions = currentQuestion.options.filter(opt => opt.id !== currentQuestion.correctAnswerId);
    const shuffledIncorrectOptions = shuffleArray(incorrectOptions);
    const optionsToDisable = shuffledIncorrectOptions.slice(0, 2).map(opt => opt.id);
    setDisabledOptionsByJoker(optionsToDisable);

    toast({
      title: "💡 %50 Jokeri Kullanıldı!",
      description: "İki yanlış şık elendi.",
      className: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400 dark:bg-yellow-400/10 dark:text-yellow-300",
    });
  };

  const handleExtraTimeJoker = () => {
    if (!jokerExtraTimeAvailable || jokerExtraTimeUsedThisQuiz || showFeedback) return;

    setJokerExtraTimeUsedThisQuiz(true);
    updateJokerStatusInFirestore('extraTime', false); 
    setJokerExtraTimeAvailable(false); 
    setTimeLeft(prev => prev + 30);

    toast({
      title: "⏱️ Ekstra Süre Jokeri Kullanıldı!",
      description: "+30 saniye eklendi.",
      className: "border-blue-500 bg-blue-500/10 text-blue-700 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-300",
    });
  };

  const handleSecondChanceJoker = () => {
    if (!jokerSecondChanceAvailable || jokerSecondChanceUsedThisQuiz || showFeedback) return;

    setJokerSecondChanceUsedThisQuiz(true);
    setSecondChanceActive(true);
    setFirstAttemptMadeWithSecondChance(false); 
    updateJokerStatusInFirestore('secondChance', false); 
    setJokerSecondChanceAvailable(false); 

    toast({
      title: "♻️ Çift Cevap Jokeri Kullanıldı!",
      description: "Yanlış cevap verirsen bir hakkın daha olacak.",
      className: "border-purple-500 bg-purple-500/10 text-purple-700 dark:border-purple-400 dark:bg-purple-400/10 dark:text-purple-300",
    });
  };


  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive">Bir Sorun Oluştu</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">
            ❌ {error}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={async () => {
              setIsLoading(true); // Set loading true for the retry attempt
              setError(null);
              try {
                await resetQuizState(); // Attempt to reset and reload
              } catch (e: any) {
                setError("Tekrar deneme sırasında bir hata oluştu: " + e.message);
              } finally {
                setIsLoading(false); // Ensure loading is false after retry attempt
              }
            }} 
            size="lg" 
            variant="outline"
          >
            Tekrar Dene
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <RotateCcw className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">🔄 Sorular yükleniyor...</p>
      </div>
    );
  }

  if (questions.length === 0 && !isLoading && !error) {
    const currentExam = EXAM_TYPES.find(e => e.id === examType);
    const currentSubjectData = SUBJECTS.find(s => s.id === subject && s.examType === examType);
    const currentTopicData = TOPICS.find(t => t.id === topic && t.subject === subject && t.examType === examType);

    return (
      <Card className="w-full max-w-2xl mx-auto text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive">Soru Bulunamadı</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-1">
            <strong>Sınav:</strong> {currentExam?.name || examType} <br />
            <strong>Ders:</strong> {currentSubjectData?.name || subject} <br />
            <strong>Konu:</strong> {currentTopicData?.name || topic}
          </p>
          <p className="text-muted-foreground mb-6">
            Bu konu için henüz soru eklenmemiş. Lütfen daha sonra tekrar deneyin veya farklı bir konu seçin.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={`/quiz/${examType}/${subject}`}>Konu Seçimine Dön</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (quizFinished) {
    const finalLevelForDisplay = currentUserLevel; // Already updated by Firestore callbacks
    return (
      <Card className="w-full max-w-2xl mx-auto text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Quiz Tamamlandı!</CardTitle>
          <CardDescription>Sonuçların aşağıda. Toplam XP: {currentUserXP}, Seviye: {finalLevelForDisplay}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckCircle2 className="w-20 h-20 text-accent dark:text-green-400 mx-auto" />
           <p className="text-lg">
            Toplam <span className="font-bold text-primary">{score}</span> doğru cevabın var. <br/>
            Toplam <span className="font-bold text-primary">{currentUserXP} XP</span> kazandın ve şu an <span className="font-bold text-primary">Seviye {finalLevelForDisplay}</span> dasın.
            <br />
            Mevcut Enerjin: <span className="font-bold text-primary">{currentUserEnergy}</span> / {MAX_ENERGY}
          </p>
          <XPBar currentXP={currentUserXP} level={finalLevelForDisplay} xpPerLevel={XP_PER_LEVEL} className="max-w-md mx-auto"/>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={async () => {
              setIsLoading(true); 
              setError(null);
              try {
                await resetQuizState();
              } catch (e: any) {
                 console.error("Error on retrying quiz:", e);
                 setError("Quiz yeniden başlatılırken bir sorun oluştu: " + e.message);
              } finally {
                setIsLoading(false);
              }
            }} 
            variant="default" 
            size="lg"
            disabled={isLoading}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            {isLoading ? 'Yükleniyor...' : 'Tekrar Çöz'}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuestion) {
     return <div className="text-center text-muted-foreground">Soru yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</div>;
  }

  const canSubmitAnswer = currentUserEnergy >= ENERGY_COST_PER_ANSWER || (secondChanceActive && firstAttemptMadeWithSecondChance);
  const currentLevelForDisplay = currentUserLevel; 

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch mb-2 p-3 bg-card rounded-md shadow text-sm text-foreground gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
           <XPBar currentXP={currentUserXP} level={currentLevelForDisplay} xpPerLevel={XP_PER_LEVEL} />
        </div>
        <div className="flex items-center gap-1 justify-end sm:justify-start">
            <Bolt className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">Enerji:</span> {currentUserEnergy}/{MAX_ENERGY}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <TimerDisplay timeLeft={timeLeft} totalTime={TOTAL_QUIZ_TIME_SECONDS} />
        <ScoreDisplay currentProgress={currentQuestionIndex + 1} totalQuestions={questions.length} />
      </div>

      {!showFeedback && !quizFinished && (
        <Card className="mb-6 shadow-md bg-[#1e213a] rounded-xl py-4 px-5 mt-6 text-center">
          <CardHeader className="pb-2 pt-3 text-center">
            <CardTitle className="text-xl font-semibold text-[#a78bfa] mb-4 text-center">
              🎲 Joker Hakların
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap pt-4 px-3 pb-3">
            <Button
              id="jokerFiftyFiftyBtn"
              onClick={handleFiftyFiftyJoker}
              disabled={!jokerFiftyFiftyAvailable || jokerFiftyFiftyUsedThisQuiz || showFeedback}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed group text-white hover:bg-yellow-600 border-yellow-500 hover:border-yellow-600 bg-yellow-500/80"
            >
              <Percent className="mr-2 h-4 w-4 text-white group-disabled:text-gray-300" />
              %50
            </Button>
            <Button
              id="jokerExtraTimeBtn"
              onClick={handleExtraTimeJoker}
              disabled={!jokerExtraTimeAvailable || jokerExtraTimeUsedThisQuiz || showFeedback}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed group text-white hover:bg-blue-600 border-blue-500 hover:border-blue-600 bg-blue-500/80"
            >
              <Timer className="mr-2 h-4 w-4 text-white group-disabled:text-gray-300" />
              Ekstra Süre
            </Button>
            <Button
              id="jokerSecondChanceBtn"
              onClick={handleSecondChanceJoker}
              disabled={!jokerSecondChanceAvailable || jokerSecondChanceUsedThisQuiz || showFeedback || secondChanceActive}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed group text-white hover:bg-purple-600 border-purple-500 hover:border-purple-600 bg-purple-500/80"
            >
              <RefreshCw className="mr-2 h-4 w-4 text-white group-disabled:text-gray-300" />
              Çift Cevap
            </Button>
          </CardContent>
        </Card>
      )}


      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/50 dark:bg-muted/30">
          <CardTitle className="font-headline text-xl sm:text-2xl text-primary">
            Soru {currentQuestionIndex + 1} / {questions.length}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg pt-2 text-foreground">{currentQuestion.text}</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <RadioGroup
            key={`${currentQuestion.id}-${currentQuestionIndex}-${disabledOptionsByJoker.join('-')}`} 
            value={selectedAnswerId || undefined} 
            onValueChange={handleAnswerSelect}
            disabled={showFeedback || quizFinished}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => {
              const isUserSelected = selectedAnswerId === option.id;
              const isActuallyCorrect = option.id === currentQuestion.correctAnswerId;
              const isJokerDisabled = disabledOptionsByJoker.includes(option.id);

              let optionStyle = "border-muted hover:border-primary dark:hover:border-primary";
              let animationClass = "";

              if (showFeedback && !secondChanceActive) { 
                if (isActuallyCorrect) {
                  optionStyle = "bg-accent/20 border-accent text-accent-foreground dark:bg-green-500/20 dark:border-green-500 dark:text-green-200 font-semibold ring-2 ring-accent dark:ring-green-500 hover:bg-accent/30 dark:hover:bg-green-500/30";
                  animationClass = "animate-pop";
                } else if (isUserSelected && !isActuallyCorrect) {
                  optionStyle = "bg-destructive/20 border-destructive text-destructive-foreground dark:bg-red-500/20 dark:border-red-500 dark:text-red-200 font-semibold ring-2 ring-destructive dark:ring-red-500 hover:bg-destructive/30 dark:hover:bg-red-500/30";
                  animationClass = "animate-shake";
                } else {
                  optionStyle = "border-muted opacity-60 dark:opacity-50"; 
                }
              } else if (isJokerDisabled) {
                 optionStyle = "border-muted opacity-40 line-through text-muted-foreground/70 cursor-not-allowed";
              } else if (isUserSelected) { 
                optionStyle = "border-primary ring-2 ring-primary dark:border-primary dark:ring-primary";
              }
              
              const finalDisabledStatus = showFeedback || quizFinished || (isJokerDisabled && !showFeedback);

              return (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-4 border rounded-lg transition-all duration-200 ease-in-out",
                    optionStyle,
                    animationClass,
                    finalDisabledStatus ? "cursor-not-allowed" : "cursor-pointer hover:shadow-md",
                    (isJokerDisabled && !showFeedback && !finalDisabledStatus) ? "pointer-events-none" : "" 
                  )}
                >
                  <RadioGroupItem 
                    value={option.id} 
                    id={option.id} 
                    disabled={finalDisabledStatus} 
                    aria-label={option.text}
                    className={cn(isJokerDisabled && !showFeedback ? "border-muted-foreground/50" : "")}
                  />
                  <span className={cn("text-sm sm:text-base flex-1", isJokerDisabled && !showFeedback ? "text-muted-foreground/70" : "")}>{option.text}</span>
                   {showFeedback && isActuallyCorrect && <CheckCircle2 className="ml-auto h-5 w-5 text-accent dark:text-green-400 shrink-0" />}
                   {showFeedback && isUserSelected && !isActuallyCorrect && <XCircle className="ml-auto h-5 w-5 text-destructive dark:text-red-400 shrink-0" />}
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
        <CardFooter className="border-t pt-6 dark:border-border/50">
          {!showFeedback || (secondChanceActive && !firstAttemptMadeWithSecondChance) ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswerId || quizFinished || (!canSubmitAnswer && !secondChanceActive) || (showFeedback && !secondChanceActive)}
              className="w-full sm:w-auto"
              size="lg"
              title={!canSubmitAnswer && !secondChanceActive ? `Yeterli enerji yok (${ENERGY_COST_PER_ANSWER} gerekli)` : undefined}
            >
              {secondChanceActive && firstAttemptMadeWithSecondChance ? "Cevabı Onayla (2. Hak)" : "Cevabı Gönder"}
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion} 
              className="w-full sm:w-auto" 
              size="lg" 
              disabled={quizFinished && currentQuestionIndex >= questions.length -1 } 
            >
              {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
