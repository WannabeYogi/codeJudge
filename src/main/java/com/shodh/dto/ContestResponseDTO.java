package com.shodh.dto;

import java.util.List;

import com.shodh.model.Contest;
import com.shodh.model.Problem;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContestResponseDTO {
    private String id;
    private String name;
    private List<ProblemDTO> problems;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemDTO {
        private String id;
        private String title;
        private String description;
        private Long timeLimitMs;
        private Integer memoryLimitMb;
        
        public static ProblemDTO fromProblem(Problem problem) {
            return ProblemDTO.builder()
                    .id(problem.getId())
                    .title(problem.getTitle())
                    .description(problem.getDescription())
                    .timeLimitMs(problem.getTimeLimitMs())
                    .memoryLimitMb(problem.getMemoryLimitMb())
                    .build();
        }
    }
    
    public static ContestResponseDTO fromContest(Contest contest, List<Problem> problems) {
        List<ProblemDTO> problemDTOs = problems.stream()
                .map(ProblemDTO::fromProblem)
                .toList();
        
        return ContestResponseDTO.builder()
                .id(contest.getId())
                .name(contest.getName())
                .problems(problemDTOs)
                .build();
    }
}
