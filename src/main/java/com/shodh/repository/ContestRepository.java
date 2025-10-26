package com.shodh.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.shodh.model.Contest;

@Repository
public interface ContestRepository extends MongoRepository<Contest, String> {
}
