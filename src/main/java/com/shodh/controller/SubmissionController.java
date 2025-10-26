package com.shodh.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shodh.dto.SubmissionIdResponseDTO;
import com.shodh.dto.SubmissionRequestDTO;
import com.shodh.dto.SubmissionResponseDTO;
import com.shodh.service.SubmissionService;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;
    
    @PostMapping
    public ResponseEntity<SubmissionIdResponseDTO> createSubmission(@RequestBody SubmissionRequestDTO request) {
        String submissionId = submissionService.createSubmission(request);
        return ResponseEntity.ok(new SubmissionIdResponseDTO(submissionId));
    }
    
    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionResponseDTO> getSubmission(@PathVariable String submissionId) {
        return ResponseEntity.ok(submissionService.getSubmission(submissionId));
    }
}
