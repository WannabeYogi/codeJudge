package com.shodh.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shodh.dto.LeaderboardEntryDTO;
import com.shodh.model.Problem;
import com.shodh.model.Submission;
import com.shodh.model.User;
import com.shodh.repository.ProblemRepository;
import com.shodh.repository.SubmissionRepository;
import com.shodh.repository.UserRepository;

@Service
public class LeaderboardService {

    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<LeaderboardEntryDTO> getLeaderboard(String contestId) {
        try {
            // Get all problems for this contest
            List<Problem> problems = problemRepository.findByContestId(contestId);
            
            if (problems.isEmpty()) {
                return new ArrayList<>(); // Return empty list if no problems found
            }
            
            List<String> problemIds = problems.stream()
                    .map(Problem::getId)
                    .collect(Collectors.toList());
            
            // Get all accepted submissions for these problems
            List<Submission> acceptedSubmissions = submissionRepository
                    .findByProblemIdInAndStatus(problemIds, Submission.SubmissionStatus.ACCEPTED);
            
            if (acceptedSubmissions.isEmpty()) {
                return new ArrayList<>(); // Return empty list if no accepted submissions
            }
            
            // Group submissions by user
            Map<String, List<Submission>> submissionsByUser = acceptedSubmissions.stream()
                    .collect(Collectors.groupingBy(Submission::getUserId));
            
            // Calculate leaderboard entries
            List<LeaderboardEntryDTO> leaderboard = new ArrayList<>();
            
            for (Map.Entry<String, List<Submission>> entry : submissionsByUser.entrySet()) {
                String userId = entry.getKey();
                List<Submission> userSubmissions = entry.getValue();
                
                // Get user details - handle case where user might not exist
                User user = userRepository.findById(userId).orElse(null);
                if (user == null) {
                    // Skip this user if not found
                    continue;
                }
                
                // Count unique solved problems
                Map<String, Submission> fastestSubmissionByProblem = new HashMap<>();
                
                for (Submission submission : userSubmissions) {
                    String problemId = submission.getProblemId();
                    if (!fastestSubmissionByProblem.containsKey(problemId) || 
                            (submission.getRuntimeMs() != null && 
                             fastestSubmissionByProblem.get(problemId).getRuntimeMs() != null &&
                             submission.getRuntimeMs() < fastestSubmissionByProblem.get(problemId).getRuntimeMs())) {
                        fastestSubmissionByProblem.put(problemId, submission);
                    }
                }
                
                int solvedCount = fastestSubmissionByProblem.size();
                
                // Calculate total penalty (sum of runtimes for fastest solutions)
                long totalPenalty = fastestSubmissionByProblem.values().stream()
                        .mapToLong(s -> s.getRuntimeMs() != null ? s.getRuntimeMs() : 0)
                        .sum();
                
                leaderboard.add(LeaderboardEntryDTO.builder()
                        .username(user.getUsername())
                        .solvedCount(solvedCount)
                        .totalPenalty(totalPenalty)
                        .build());
            }
            
            // Sort by solved count (desc) and then by penalty (asc)
            leaderboard.sort((a, b) -> {
                int compareByCount = Integer.compare(b.getSolvedCount(), a.getSolvedCount());
                if (compareByCount != 0) {
                    return compareByCount;
                }
                return Long.compare(a.getTotalPenalty(), b.getTotalPenalty());
            });
            
            return leaderboard;
        } catch (Exception e) {
            // Log the error and return empty list
            System.err.println("Error in getLeaderboard: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}