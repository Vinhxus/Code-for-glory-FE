/**
 * RoadmapViewer.patch.ts
 * ═══════════════════════════════════════════════════════════════════
 * PATCH GUIDE — apply these changes to your existing RoadmapViewer.tsx
 *
 * This file is NOT imported anywhere. Read it and apply each section
 * to RoadmapViewer.tsx manually (or ask Claude to merge it).
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// 1.  UPDATE PROPS TYPE
// ─────────────────────────────────────────────────────────────────
//
// Find your existing Props type (or interface) in RoadmapViewer.tsx
// and ADD the three new fields below. Do NOT remove the old ones.
//
// import type { StartingStage } from '../utils/learningPathUtils';  ← add this import
//
// type RoadmapViewerProps = {
//   // ── existing props ───────────────────
//   selected:       RoadmapKey;
//   apiNodes:       LearningPathNodeDto[];
//   apiProgress:    ProgressDto[];
//   loading:        boolean;
//   error:          string;
//   surveyData?:    { careerPath?: string; hoursPerDay?: number; testScore?: number } | null;
//   // ── NEW props ────────────────────────
//   startingStage:       StartingStage;          // 'beginner' | 'intermediate' | 'advanced'
//   preUnlockedStages:   StartingStage[];         // stages auto-completed before user starts
// };


// ─────────────────────────────────────────────────────────────────
// 2.  MAP EACH NODE TO A STAGE
// ─────────────────────────────────────────────────────────────────
//
// Add this helper (or merge into your existing node-mapping logic).
// The key is that every node must know which stage it belongs to so
// we can decide: locked / pre-unlocked / active.
//
// Your milestoneOrder field (on LearningPathNodeDto) already indicates
// which milestone a node belongs to. Stages are groupings of milestones:
//
//   Frontend (example layout):
//     milestoneOrder 1-4  → 'beginner'
//     milestoneOrder 5-8  → 'intermediate'
//     milestoneOrder 9+   → 'advanced'
//
// If you use mock data with explicit stage labels, use those instead.
// Adjust the numbers below to match your actual roadmap structure.

import type { StartingStage } from '../utils/learningPathUtils';
import type { LearningPathNodeDto } from '../services/learningPathApi';

export function nodeToStage(node: LearningPathNodeDto): StartingStage {
  const m = node.milestoneOrder ?? 0;
  if (m <= 4) return 'beginner';
  if (m <= 8) return 'intermediate';
  return 'advanced';
}


// ─────────────────────────────────────────────────────────────────
// 3.  STAGE ORDER (for comparison)
// ─────────────────────────────────────────────────────────────────

const STAGE_ORDER: Record<StartingStage, number> = {
  beginner:     0,
  intermediate: 1,
  advanced:     2,
};

/** True if stageA comes before stageB in the learning sequence. */
export function isStageBefore(a: StartingStage, b: StartingStage) {
  return STAGE_ORDER[a] < STAGE_ORDER[b];
}


// ─────────────────────────────────────────────────────────────────
// 4.  NODE STATUS DERIVATION
// ─────────────────────────────────────────────────────────────────
//
// Replace (or augment) your existing "is this node locked?" logic
// with this function. Call it per node when building the rendered list.

type NodeRenderStatus =
  | 'pre-unlocked'   // belongs to a stage the user already "passed" during onboarding
  | 'active'         // belongs to the user's starting stage (first unlocked)
  | 'locked'         // belongs to a stage beyond the starting stage
  | 'completed';     // user has actual backend/local progress marking it done

export function deriveNodeStatus(
  node: LearningPathNodeDto,
  startingStage: StartingStage,
  preUnlockedStages: StartingStage[],
  backendStatus?: string          // from ProgressDto.status
): NodeRenderStatus {
  // 1. Real backend progress always wins
  if (backendStatus === 'completed') return 'completed';

  const nodeStage = nodeToStage(node);

  // 2. Node belongs to a pre-unlocked stage → treat as completed
  if (preUnlockedStages.includes(nodeStage)) return 'pre-unlocked';

  // 3. Node belongs to the starting stage → actively unlocked
  if (nodeStage === startingStage) return 'active';

  // 4. Node is in a stage that comes AFTER the starting stage → locked
  if (STAGE_ORDER[nodeStage] > STAGE_ORDER[startingStage]) return 'locked';

  // 5. Fallback (shouldn't happen if data is consistent)
  return 'active';
}


// ─────────────────────────────────────────────────────────────────
// 5.  RENDER CHANGES  (describe in pseudo-JSX)
// ─────────────────────────────────────────────────────────────────
//
// In your existing node-card JSX, replace the hard-coded lock/unlock
// logic with the status derived above:
//
//   const status = deriveNodeStatus(node, startingStage, preUnlockedStages, progressEntry?.status);
//
//   // ── Card appearance ──────────────────────────────────────────
//   if (status === 'pre-unlocked') {
//     // Green checkmark, muted text, "Completed (unlocked)" label
//     // Clicking opens a read-only summary; no action required
//     cardStyle = { border: 'rgba(74,222,128,0.35)', opacity: 0.72 };
//     badge    = <span style={{color:'#4ade80'}}>✓ Pre-unlocked</span>;
//     icon     = <span className="material-symbols-outlined">check_circle</span>;
//   }
//
//   if (status === 'active') {
//     // Normal interactive card — user can start here
//     // Optionally add a pulsing blue ring on the FIRST active node
//     // to draw the eye directly to where they should begin.
//     cardStyle = { border: 'rgba(59,130,246,0.55)', boxShadow: '0 0 0 3px rgba(59,130,246,0.18)' };
//     badge    = <span className="animate-status-pulse" style={{color:'#60a5fa'}}>● IN PROGRESS</span>;
//   }
//
//   if (status === 'locked') {
//     // Greyed out, lock icon, pointer-events-none
//     cardStyle = { opacity: 0.40, filter: 'grayscale(0.6)' };
//     badge    = <span className="material-symbols-outlined" style={{color:'rgba(255,255,255,0.25)'}}>lock</span>;
//   }
//
//   if (status === 'completed') {
//     // Full green, trophy / check icon
//     cardStyle = { border: 'rgba(74,222,128,0.55)' };
//     badge    = <span style={{color:'#4ade80'}}>✓ Completed</span>;
//   }


// ─────────────────────────────────────────────────────────────────
// 6.  STAGE SECTION HEADERS  (how to render stage separators)
// ─────────────────────────────────────────────────────────────────
//
// Before rendering the first node of each stage, render a stage header:
//
//   {stage === startingStage && (
//     <div className="…" style={{color: '#60a5fa'}}>
//       ⭐ Your starting point — {stageLabelText(startingStage, lang)} Stage
//     </div>
//   )}
//
//   {preUnlockedStages.includes(stage) && (
//     <div className="…" style={{color: '#4ade80'}}>
//       ✓ {stageLabelText(stage, lang)} Stage — Pre-unlocked
//     </div>
//   )}
//
//   {STAGE_ORDER[stage] > STAGE_ORDER[startingStage] && (
//     <div className="…" style={{color: 'rgba(255,255,255,0.30)'}}>
//       🔒 {stageLabelText(stage, lang)} Stage — Complete previous stage to unlock
//     </div>
//   )}


// ─────────────────────────────────────────────────────────────────
// 7.  MOCK DATA  (if backend not available)
// ─────────────────────────────────────────────────────────────────
//
// If you maintain a MOCK_ROADMAP object in RoadmapViewer for when the
// backend is unavailable, add a `stage` field to each milestone entry:
//
//   { milestoneOrder: 1, stage: 'beginner',     title: 'Web & Internet Basics', … },
//   { milestoneOrder: 2, stage: 'beginner',     title: 'Basic HTML Structure',  … },
//   { milestoneOrder: 5, stage: 'intermediate', title: 'React Fundamentals',    … },
//   { milestoneOrder: 9, stage: 'advanced',     title: 'Performance & Scaling', … },
//
// Then in nodeToStage() above, read node.stage directly instead of
// inferring from milestoneOrder ranges.

export {};   // make TypeScript treat this as a module
