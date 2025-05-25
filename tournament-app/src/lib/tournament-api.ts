import { RoundRequest, RoundResponse, Candidate } from '@/types/tournament';

export class TournamentAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async getCandidates(): Promise<{ candidates: Candidate[]; totalCount: number }> {
    const response = await fetch(`${this.baseUrl}/api/candidates`);
    if (!response.ok) {
      throw new Error(`Failed to get candidates: ${response.statusText}`);
    }
    return response.json();
  }

  async getTournamentInfo(): Promise<{ message: string; totalCandidates: number }> {
    const response = await fetch(`${this.baseUrl}/api/tournament`);
    if (!response.ok) {
      throw new Error(`Failed to get tournament info: ${response.statusText}`);
    }
    return response.json();
  }

  async runRound(params: RoundRequest): Promise<RoundResponse> {
    const response = await fetch(`${this.baseUrl}/api/tournament`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// Default instance for convenience
export const tournamentAPI = new TournamentAPI(); 