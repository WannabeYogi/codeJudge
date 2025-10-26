package com.shodh.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.shodh.model.Submission;
import com.shodh.model.Submission.SubmissionStatus;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByStatus(SubmissionStatus status);
    List<Submission> findByProblemIdAndStatus(String problemId, SubmissionStatus status);
    List<Submission> findByUserIdAndProblemIdAndStatus(String userId, String problemId, SubmissionStatus status);
    List<Submission> findByUserIdAndStatus(String userId, SubmissionStatus status);
    List<Submission> findByProblemIdInAndStatus(List<String> problemIds, SubmissionStatus status);
}
