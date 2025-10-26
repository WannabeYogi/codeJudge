package com.shodh.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    @Id
    private String id;
    private String userId;
    private String problemId;
    private String language;
    private String code;
    
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING;
    
    private String verdict;
    private Long runtimeMs;
    private Integer memoryUsedMb;
    private String output;
    private String errorLog;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    public enum SubmissionStatus {
        PENDING, RUNNING, ACCEPTED, WRONG_ANSWER, TLE, RE, CE, MLE
    }
}
