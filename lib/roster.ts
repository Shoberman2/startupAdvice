/**
 * Build-time reader for the generated founder roster. The landing page derives
 * its voice count, post count, and marquee names from ROSTER.md so the numbers
 * can never drift from the corpus.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface RosterMember {
  name: string;
  company: string;
  posts: number;
  wordsK: number;
  slug: string;
}

const ROSTER_PATH = join(process.cwd(), ".claude", "founders-corpus", "ROSTER.md");

const ROW_PATTERN = /^\|\s*\d+\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*(\d+)\s*\|\s*(\d+)k\s*\|\s*`([^`]+)`\s*\|$/gm;

export function parseRoster(source: string): RosterMember[] {
  return [...source.matchAll(ROW_PATTERN)].map((match) => ({
    name: match[1].trim(),
    company: match[2].trim(),
    posts: Number(match[3]),
    wordsK: Number(match[4]),
    slug: match[5].trim(),
  }));
}

export function loadRoster(): RosterMember[] {
  return parseRoster(readFileSync(ROSTER_PATH, "utf8"));
}

export interface RosterStats {
  voices: number;
  posts: number;
  /** Total corpus size as a display string, e.g. "3.9". */
  millionWords: string;
}

export function rosterStats(members: RosterMember[] = loadRoster()): RosterStats {
  return {
    voices: members.length,
    posts: members.reduce((sum, member) => sum + member.posts, 0),
    millionWords: (members.reduce((sum, member) => sum + member.wordsK, 0) / 1000).toFixed(1),
  };
}
