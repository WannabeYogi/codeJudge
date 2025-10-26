import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface Contest {
  id: string;
  name: string;
}

export interface ContestWithProblems extends Contest {
  problems: Problem[];
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  timeLimitMs: number;
  memoryLimitMb: number;
}

export interface SubmissionRequest {
  userId: string;
  contestId: string;
  problemId: string;
  language: string;
  code: string;
}

export interface SubmissionResponse {
  id: string;
  userId: string;
  problemId: string;
  status: 'PENDING' | 'RUNNING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TLE' | 'RE' | 'CE' | 'MLE';
  verdict: string | null;
  runtimeMs: number | null;
  memoryUsedMb: number | null;
  output: string | null;
  errorLog: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionIdResponse {
  submissionId: string;
}

export interface LeaderboardEntry {
  username: string;
  solvedCount: number;
  totalPenalty: number;
}

export interface User {
  id: string;
  username: string;
}

export interface UserRequest {
  username: string;
}

// API functions
export const apiService = {
  // Contests
  getContests: async (): Promise<Contest[]> => {
    try {
      const response = await api.get('/api/contests');
      return response.data;
    } catch (error) {
      console.error('Error fetching contests:', error);
      throw error;
    }
  },

  // Contest details with problems
  getContestDetails: async (contestId: string): Promise<ContestWithProblems> => {
    try {
      const response = await api.get(`/api/contests/${contestId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contest ${contestId}:`, error);
      throw error;
    }
  },

  // Submit code
  submitCode: async (submission: SubmissionRequest): Promise<SubmissionIdResponse> => {
    try {
      const response = await api.post('/api/submissions', submission);
      return response.data;
    } catch (error) {
      console.error('Error submitting code:', error);
      throw error;
    }
  },

  // Get submission status
  getSubmission: async (submissionId: string): Promise<SubmissionResponse> => {
    try {
      const response = await api.get(`/api/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching submission ${submissionId}:`, error);
      throw error;
    }
  },

  // Get leaderboard
  getLeaderboard: async (contestId: string): Promise<LeaderboardEntry[]> => {
    try {
      const response = await api.get(`/api/contests/${contestId}/leaderboard`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching leaderboard for contest ${contestId}:`, error);
      throw error;
    }
  },

  // User management
  createUser: async (username: string): Promise<User> => {
    try {
      const response = await api.post('/api/users', { username });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  getUserByUsername: async (username: string): Promise<User> => {
    try {
      const response = await api.get(`/api/users/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${username}:`, error);
      throw error;
    }
  }
};

export default apiService;