/**
 * learningPathUtils.ts
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for mapping onboarding results → roadmap stage.
 *
 * Storage layout (never change these keys):
 *   cg_skill_assessment_v1  ← OnboardingAssessment  (maxDifficultyByTrack, score, …)
 *   cg_survey_v1            ← OnboardingQuiz         (experienceLevel, tracks, …)
 *   cg_quiz_v1              ← OnboardingQuiz result  (score, total, …)
 *
 * Stage rules
 * ───────────
 *  beginner     → user starts at Beginner Stage; all higher stages are locked
 *  intermediate → Beginner Stage is pre-unlocked (shown as "completed"),
 *                 user starts at Intermediate Stage
 *  advanced     → Beginner + Intermediate Stages are pre-unlocked,
 *                 user starts at Advanced Stage
 */

export type StartingStage = 'beginner' | 'intermediate' | 'advanced';

// ─── Storage keys (mirrors every onboarding file) ────────────────
const ASSESSMENT_KEY = 'cg_skill_assessment_v1';
const SURVEY_KEY     = 'cg_survey_v1';
const QUIZ_KEY       = 'cg_quiz_v1';

// ─── Internal types (minimal subset we actually read) ─────────────
type Difficulty = 'easy' | 'medium' | 'hard';
type SkillTrack = 'frontend' | 'backend';

type AssessmentSnapshot = {
  maxDifficultyByTrack?: Partial<Record<SkillTrack, Difficulty>>;
  score?: {
    frontend?: { score: number; total: number } | null;
    backend?: { score: number; total: number } | null;
  };
};

type SurveySnapshot = {
  experienceLevel?: string; // 'novice' | 'apprentice' | 'journeyman' | 'master'
};

type QuizSnapshot = {
  score?: number;
  total?: number;
};

// ─── Helpers ─────────────────────────────────────────────────────
function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Map maxDifficulty passed in the assessment to a starting stage.
 *  easy   → beginner
 *  medium → intermediate
 *  hard   → advanced
 */
function difficultyToStage(d: Difficulty | undefined): StartingStage {
  if (d === 'hard')   return 'advanced';
  if (d === 'medium') return 'intermediate';
  return 'beginner';
}

/**
 * Fallback: derive a rough stage from the quick onboarding quiz score %.
 *  ≥ 80 %  → advanced
 *  ≥ 50 %  → intermediate
 *  < 50 %  → beginner
 */
function scoreToStage(score: number, total: number): StartingStage {
  if (total === 0) return 'beginner';
  const pct = score / total;
  if (pct >= 0.8) return 'advanced';
  if (pct >= 0.5) return 'intermediate';
  return 'beginner';
}

/**
 * Another fallback: self-reported experience level from OnboardingQuiz.
 *  novice      → beginner
 *  apprentice  → beginner
 *  journeyman  → intermediate
 *  master      → advanced
 */
function experienceToStage(level: string | undefined): StartingStage {
  if (level === 'master')      return 'advanced';
  if (level === 'journeyman')  return 'intermediate';
  return 'beginner';
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Derive the starting stage for the given track from every available
 * onboarding signal, in priority order:
 *
 *  1. `cg_skill_assessment_v1`.maxDifficultyByTrack[track]  (most precise)
 *  2. `cg_quiz_v1` score %                                   (quick quiz)
 *  3. `cg_survey_v1`.experienceLevel                         (self-report)
 *  4. Default → 'beginner'
 */
export function getStartingStage(track: SkillTrack): StartingStage {
  // 1. Full assessment result
  const assessment = readJson<AssessmentSnapshot>(ASSESSMENT_KEY);
  const maxDiff = assessment?.maxDifficultyByTrack?.[track];
  if (maxDiff) return difficultyToStage(maxDiff);

  // 2. Quick calibration quiz
  const quiz = readJson<QuizSnapshot>(QUIZ_KEY);
  if (quiz?.score != null && quiz?.total) {
    return scoreToStage(quiz.score, quiz.total);
  }

  // 3. Self-reported level
  const survey = readJson<SurveySnapshot>(SURVEY_KEY);
  if (survey?.experienceLevel) {
    return experienceToStage(survey.experienceLevel);
  }

  return 'beginner';
}

/**
 * Returns which stages should be treated as "pre-unlocked" (auto-completed)
 * given a starting stage. These stages are rendered as complete / skippable,
 * allowing the user to jump straight to their stage.
 *
 *  beginner     → []                           (nothing pre-unlocked)
 *  intermediate → ['beginner']
 *  advanced     → ['beginner', 'intermediate']
 */
export function getPreUnlockedStages(stage: StartingStage): StartingStage[] {
  if (stage === 'advanced')     return ['beginner', 'intermediate'];
  if (stage === 'intermediate') return ['beginner'];
  return [];
}

/**
 * Human-readable label for the starting stage.
 */
export function stageLabelText(
  stage: StartingStage,
  lang: 'en' | 'vi' = 'en'
): string {
  const labels: Record<StartingStage, { en: string; vi: string }> = {
    beginner:     { en: 'Beginner',     vi: 'Cơ bản' },
    intermediate: { en: 'Intermediate', vi: 'Trung cấp' },
    advanced:     { en: 'Advanced',     vi: 'Nâng cao' },
  };
  return labels[stage][lang];
}

/**
 * Clear ALL onboarding/assessment data from localStorage so the user
 * can retake the full flow from scratch.
 *
 * Call this from a "Retake assessment" / "Reset progress" button.
 */
export function clearOnboardingData(): void {
  [ASSESSMENT_KEY, SURVEY_KEY, QUIZ_KEY].forEach((k) =>
    localStorage.removeItem(k)
  );
}
