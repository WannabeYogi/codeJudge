package com.shodh.dto;

import java.time.LocalDateTime;

import com.shodh.model.Submission;
import com.shodh.model.Submission.SubmissionStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponseDTO {
    private String id;
    private String userId;
    private String problemId;
    private SubmissionStatus status;
    private String verdict;
    private Long runtimeMs;
    private Integer memoryUsedMb;
    private String output;
    private String errorLog;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static SubmissionResponseDTO fromSubmission(Submission submission) {
        return SubmissionResponseDTO.builder()
                .id(submission.getId())
                .userId(submission.getUserId())
                .problemId(submission.getProblemId())
                .status(submission.getStatus())
                .verdict(submission.getVerdict())
                .runtimeMs(submission.getRuntimeMs())
                .memoryUsedMb(submission.getMemoryUsedMb())
                .output(submission.getOutput())
                .errorLog(submission.getErrorLog())
                .createdAt(submission.getCreatedAt())
                .updatedAt(submission.getUpdatedAt())
                .build();
    }
}
