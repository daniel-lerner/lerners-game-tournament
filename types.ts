
export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  totalPoints: number;
  matchesPlayed: number;
  wins: number;
  editionId: string;
}

export type PositionPoints = Record<number, number>;
export type GameScoringRules = Record<number, PositionPoints>;

export interface Game {
  id: string;
  name: string;
  scoring: GameScoringRules;
  isPlusRule?: boolean;
}

export interface MatchResult {
  playerId: string;
  position: number;
  pointsEarned: number;
}

export interface Match {
  id: string;
  gameId: string;
  timestamp: number;
  results: MatchResult[];
  editionId: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  RANKING = 'RANKING',
  ADD_MATCH = 'ADD_MATCH',
  HISTORY = 'HISTORY',
  ADMIN = 'ADMIN'
}
