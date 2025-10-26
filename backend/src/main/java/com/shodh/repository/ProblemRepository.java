package com.shodh.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.shodh.model.Problem;

@Repository
public interface ProblemRepository extends MongoRepository<Problem, String> {
    List<Problem> findByContestId(String contestId);
}
