export interface Candidate {
  name: string;
  intro: string;
}

export interface Match {
  candidate1: Candidate;
  candidate2: Candidate;
  winner: Candidate;
  batch: number;
}

export interface RoundData {
  round: number;
  matches: Match[];
  total_batches: number;
}

export interface TournamentResult {
  champion: Candidate;
  elimination_tree: RoundData[];
}

export interface RoundResponse {
  success: boolean;
  winners: Candidate[];
  matches: Match[];
  totalBatches: number;
}

export interface RoundRequest {
  candidates: Candidate[];
  batchSize?: number;
  role?: string;
}

export interface TournamentState {
  currentRound: number;
  currentCandidates: Candidate[];
  eliminationTree: RoundData[];
  isComplete: boolean;
  champion?: Candidate;
} 