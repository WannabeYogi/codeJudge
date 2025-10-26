package com.shodh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionRequestDTO {
    private String userId;
    private String contestId;
    private String problemId;
    private String language;
    private String code;
}
