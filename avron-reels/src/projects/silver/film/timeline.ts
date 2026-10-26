import { lerp } from "../../../engine/anim";
import data from "./beats.json";

/*
 * Timeline for the silver film. beats.json is written by scripts/timeline_silver.py from the user's recording:
 * one beat per narration line, with film start/end, a chapter card before each chapter, and named cues
 * (the moment a key word is spoken). Shots only read times from here, so a new recording re-times everything.
 */
export type Beat = { id: string; section: string; text: string; start: number; end: number; cues: Record<string, number> };
export const BEATS = data.beats as Beat[];
export const DURATION: number = data.duration;
export const CARDS = data.cards as Record<string, number>;
export const CARD = 3.0;

const byId = new Map(BEATS.map((x) => [x.id, x]));
export const b = (id: string) => byId.get(id)!;
export const st = (id: string) => b(id).start;
export const en = (id: string) => b(id).end;
/** A named cue inside a beat, or a fraction of the beat when the word wasn't found. */
export const cue = (id: string, name: string, frac: number) => b(id).cues[name] ?? lerp(st(id), en(id), frac);
