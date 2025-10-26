package com.shodh.config;

import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.shodh.model.Contest;
import com.shodh.model.Problem;
import com.shodh.model.TestCase;
import com.shodh.model.User;
import com.shodh.repository.ContestRepository;
import com.shodh.repository.ProblemRepository;
import com.shodh.repository.TestCaseRepository;
import com.shodh.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private ContestRepository contestRepository;
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private TestCaseRepository testCaseRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (contestRepository.count() > 0) {
            logger.info("Data already initialized. Skipping data initialization.");
            return;
        }
        
        logger.info("Starting data initialization...");
        
        // Create sample user
        User user = User.builder()
                .username("testuser")
                .build();
        
        userRepository.save(user);
        logger.info("Created sample user: {}", user.getUsername());
        
        // Create sample contest
        Contest contest = Contest.builder()
                .name("Sample Contest")
                .build();
        
        contestRepository.save(contest);
        logger.info("Created sample contest: {}", contest.getName());
        
        // Create sample problems
        Problem problem1 = Problem.builder()
                .contestId(contest.getId())
                .title("Hello World")
                .description("Print 'Hello, World!' to the console.")
                .timeLimitMs(1000L)
                .memoryLimitMb(128)
                .build();
        
        Problem problem2 = Problem.builder()
                .contestId(contest.getId())
                .title("Sum of Two Numbers")
                .description("Given two integers A and B, return their sum.")
                .timeLimitMs(1000L)
                .memoryLimitMb(128)
                .build();
        
        Problem problem3 = Problem.builder()
                .contestId(contest.getId())
                .title("Factorial")
                .description("Calculate the factorial of a given number N.")
                .timeLimitMs(1000L)
                .memoryLimitMb(128)
                .build();
        
        problemRepository.saveAll(Arrays.asList(problem1, problem2, problem3));
        logger.info("Created 3 sample problems");
        
        // Create test cases for problem 1
        TestCase p1tc1 = TestCase.builder()
                .problemId(problem1.getId())
                .input("")
                .expectedOutput("Hello, World!")
                .build();
        
        TestCase p1tc2 = TestCase.builder()
                .problemId(problem1.getId())
                .input("")
                .expectedOutput("Hello, World!")
                .build();
        
        // Create test cases for problem 2
        TestCase p2tc1 = TestCase.builder()
                .problemId(problem2.getId())
                .input("2 3")
                .expectedOutput("5")
                .build();
        
        TestCase p2tc2 = TestCase.builder()
                .problemId(problem2.getId())
                .input("10 20")
                .expectedOutput("30")
                .build();
        
        // Create test cases for problem 3
        TestCase p3tc1 = TestCase.builder()
                .problemId(problem3.getId())
                .input("5")
                .expectedOutput("120")
                .build();
        
        TestCase p3tc2 = TestCase.builder()
                .problemId(problem3.getId())
                .input("10")
                .expectedOutput("3628800")
                .build();
        
        testCaseRepository.saveAll(Arrays.asList(p1tc1, p1tc2, p2tc1, p2tc2, p3tc1, p3tc2));
        logger.info("Created 6 sample test cases (2 for each problem)");
        
        logger.info("Data initialization completed successfully!");
    }
}
