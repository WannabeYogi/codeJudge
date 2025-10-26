package com.shodh.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shodh.dto.SubmissionRequestDTO;
import com.shodh.dto.SubmissionResponseDTO;
import com.shodh.model.Submission;
import com.shodh.repository.SubmissionRepository;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;
    
    public String createSubmission(SubmissionRequestDTO request) {
        Submission submission = Submission.builder()
                .userId(request.getUserId())
                .problemId(request.getProblemId())
                .language(request.getLanguage())
                .code(request.getCode())
                .status(Submission.SubmissionStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        
        Submission savedSubmission = submissionRepository.save(submission);
        return savedSubmission.getId();
    }
    
    public SubmissionResponseDTO getSubmission(String submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));
        
        return SubmissionResponseDTO.fromSubmission(submission);
    }
    
    public void updateSubmissionStatus(String submissionId, Submission.SubmissionStatus status) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));
        
        submission.setStatus(status);
        submission.setUpdatedAt(LocalDateTime.now());
        
        submissionRepository.save(submission);
    }
    
    public void updateSubmissionResult(
            String submissionId, 
            Submission.SubmissionStatus status, 
            String verdict, 
            Long runtimeMs, 
            Integer memoryUsedMb, 
            String output, 
            String errorLog) {
        
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));
        
        submission.setStatus(status);
        submission.setVerdict(verdict);
        submission.setRuntimeMs(runtimeMs);
        submission.setMemoryUsedMb(memoryUsedMb);
        submission.setOutput(output);
        submission.setErrorLog(errorLog);
        submission.setUpdatedAt(LocalDateTime.now());
        
        submissionRepository.save(submission);
    }
}
