package com.shodh.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "problems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Problem {
    @Id
    private String id;
    private String contestId;
    private String title;
    private String description;
    private Long timeLimitMs;
    private Integer memoryLimitMb;
}
