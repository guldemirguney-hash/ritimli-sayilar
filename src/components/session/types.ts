import type { Exercise } from '../../lib/exercises';

export interface Result { ok: boolean; info?: string; skip?: boolean }
export interface ExProps { ex: Exercise; locked: boolean; onAnswer: (r: Result) => void }
