package com.shodh.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shodh.dto.ContestResponseDTO;
import com.shodh.dto.LeaderboardEntryDTO;
import com.shodh.model.Contest;
import com.shodh.service.ContestService;
import com.shodh.service.LeaderboardService;

@RestController
@RequestMapping("/api/contests")
public class ContestController {

    @Autowired
    private ContestService contestService;
    
    @Autowired
    private LeaderboardService leaderboardService;
    
    @GetMapping
    public ResponseEntity<List<Contest>> getAllContests() {
        return ResponseEntity.ok(contestService.getAllContests());
    }
    
    @GetMapping("/{contestId}")
    public ResponseEntity<ContestResponseDTO> getContestDetails(@PathVariable String contestId) {
        return ResponseEntity.ok(contestService.getContestWithProblems(contestId));
    }
    
    @GetMapping("/{contestId}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard(@PathVariable String contestId) {
        try {
            List<LeaderboardEntryDTO> leaderboard = leaderboardService.getLeaderboard(contestId);
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            System.err.println("Error in getLeaderboard controller: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}