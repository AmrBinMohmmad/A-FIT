// Mirrors app/Enums/Avatar.php exactly
export type AvatarKey =
  | "fox"
  | "panda"
  | "tiger"
  | "lion"
  | "frog"
  | "koala"
  | "unicorn"
  | "octopus"
  | "penguin"
  | "owl"
  | "turtle"
  | "dolphin"
  | "butterfly"
  | "bee"
  | "rocket"
  | "star";

/** The predefined avatars a user picks from (no photo uploads — owner decision 2026-10-31). */
export const AVATARS: Record<AvatarKey, string> = {
  fox: "🦊",
  panda: "🐼",
  tiger: "🐯",
  lion: "🦁",
  frog: "🐸",
  koala: "🐨",
  unicorn: "🦄",
  octopus: "🐙",
  penguin: "🐧",
  owl: "🦉",
  turtle: "🐢",
  dolphin: "🐬",
  butterfly: "🦋",
  bee: "🐝",
  rocket: "🚀",
  star: "⭐",
};

export const AVATAR_KEYS = Object.keys(AVATARS) as AvatarKey[];

/** Rank glyphs on the group ledger: a crown for first, medals for second and third. */
export const RANK_EMOJI: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };
