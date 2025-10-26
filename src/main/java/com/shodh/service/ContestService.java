package com.shodh.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shodh.dto.ContestResponseDTO;
import com.shodh.model.Contest;
import com.shodh.model.Problem;
import com.shodh.repository.ContestRepository;
import com.shodh.repository.ProblemRepository;

@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepository;
    
    @Autowired
    private ProblemRepository problemRepository;
    
    public ContestResponseDTO getContestWithProblems(String contestId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found with id: " + contestId));
        
        List<Problem> problems = problemRepository.findByContestId(contestId);
        
        return ContestResponseDTO.fromContest(contest, problems);
    }
}
