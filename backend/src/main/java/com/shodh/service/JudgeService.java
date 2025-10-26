package com.shodh.service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.shodh.model.Problem;
import com.shodh.model.Submission;
import com.shodh.model.TestCase;
import com.shodh.repository.ProblemRepository;
import com.shodh.repository.SubmissionRepository;
import com.shodh.repository.TestCaseRepository;

@Service
public class JudgeService {
    private static final Logger logger = LoggerFactory.getLogger(JudgeService.class);
    
    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir") + "/shodh";
    private static final String DOCKER_IMAGE = "judge-image:latest";
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private TestCaseRepository testCaseRepository;
    
    @Autowired
    private SubmissionService submissionService;
    
    @Scheduled(fixedDelay = 5000) // Poll every 5 seconds
    public void pollPendingSubmissions() {
        List<Submission> pendingSubmissions = submissionRepository.findByStatus(Submission.SubmissionStatus.PENDING);
        
        for (Submission submission : pendingSubmissions) {
            try {
                processSubmission(submission);
            } catch (Exception e) {
                logger.error("Error processing submission: " + submission.getId(), e);
                submissionService.updateSubmissionResult(
                    submission.getId(),
                    Submission.SubmissionStatus.RE,
                    "Internal judge error: " + e.getMessage(),
                    null,
                    null,
                    null,
                    e.getMessage()
                );
            }
        }
    }
    
    private void processSubmission(Submission submission) throws IOException, InterruptedException {
        String submissionId = submission.getId();
        
        // Update status to RUNNING
        submissionService.updateSubmissionStatus(submissionId, Submission.SubmissionStatus.RUNNING);
        
        // Get problem details
        Problem problem = problemRepository.findById(submission.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + submission.getProblemId()));
        
        // Get test cases
        List<TestCase> testCases = testCaseRepository.findByProblemId(problem.getId());
        
        // Create temp directory
        String submissionDir = TEMP_DIR + "/" + submissionId;
        Path dirPath = Paths.get(submissionDir);
        Files.createDirectories(dirPath);
        
        try {
            // Write user code to file
            writeToFile(submissionDir + "/Main.java", submission.getCode());
            
            // Process each test case
            List<TestResult> testResults = new ArrayList<>();
            
            // Log problem details for debugging
            logger.info("Processing submission for problem: {}, id: {}", problem.getTitle(), problem.getId());
            
            for (int i = 0; i < testCases.size(); i++) {
                TestCase testCase = testCases.get(i);
                
                // Write input to file with proper formatting
                String input = testCase.getInput();
                logger.info("Test case #{} input: '{}', expected output: '{}'", 
                          i+1, input, testCase.getExpectedOutput());
                writeToFile(submissionDir + "/input.txt", input);
                
                // Run Docker container
                TestResult result = runInDocker(submissionDir, problem, testCase);
                testResults.add(result);
                
                // If compilation error, no need to run other test cases
                if (result.getVerdict() == Verdict.CE) {
                    break;
                }
            }
            
            // Aggregate results
            Submission.SubmissionStatus finalStatus;
            String finalVerdict;
            Long runtimeMs = 0L;
            Integer memoryUsedMb = 0;
            String output = "";
            String errorLog = "";
            
            // Check for compilation error first
            if (testResults.stream().anyMatch(r -> r.getVerdict() == Verdict.CE)) {
                finalStatus = Submission.SubmissionStatus.CE;
                finalVerdict = "Compilation Error";
                TestResult ceResult = testResults.stream()
                        .filter(r -> r.getVerdict() == Verdict.CE)
                        .findFirst().orElse(null);
                errorLog = ceResult != null ? ceResult.getErrorOutput() : "Compilation failed";
            } 
            // Check for other errors
            else {
                TestResult failedResult = testResults.stream()
                        .filter(r -> r.getVerdict() != Verdict.AC)
                        .findFirst().orElse(null);
                
                if (failedResult != null) {
                    switch (failedResult.getVerdict()) {
                        case TLE:
                            finalStatus = Submission.SubmissionStatus.TLE;
                            finalVerdict = "Time Limit Exceeded";
                            break;
                        case MLE:
                            finalStatus = Submission.SubmissionStatus.MLE;
                            finalVerdict = "Memory Limit Exceeded";
                            break;
                        case RE:
                            finalStatus = Submission.SubmissionStatus.RE;
                            finalVerdict = "Runtime Error";
                            errorLog = failedResult.getErrorOutput();
                            break;
                        default:
                            finalStatus = Submission.SubmissionStatus.WRONG_ANSWER;
                            finalVerdict = "Wrong Answer";
                            output = failedResult.getOutput();
                            break;
                    }
                    runtimeMs = failedResult.getRuntimeMs();
                    memoryUsedMb = failedResult.getMemoryUsedMb();
                } else {
                    // All tests passed
                    finalStatus = Submission.SubmissionStatus.ACCEPTED;
                    finalVerdict = "Accepted";
                    
                    // Use the maximum runtime and memory from all test cases
                    runtimeMs = testResults.stream()
                            .mapToLong(TestResult::getRuntimeMs)
                            .max().orElse(0);
                    
                    memoryUsedMb = testResults.stream()
                            .mapToInt(TestResult::getMemoryUsedMb)
                            .max().orElse(0);
                    
                    output = "All test cases passed";
                }
            }
            
            // Update submission with final results
            submissionService.updateSubmissionResult(
                submissionId,
                finalStatus,
                finalVerdict,
                runtimeMs,
                memoryUsedMb,
                output,
                errorLog
            );
            
        } finally {
            // Clean up temp directory
            deleteDirectory(new File(submissionDir));
        }
    }
    
    private TestResult runInDocker(String submissionDir, Problem problem, TestCase testCase) throws IOException, InterruptedException {
        // Log the directory for debugging
        logger.debug("Submission directory: {}", submissionDir);
        
        // Create a ProcessBuilder with the appropriate command
        ProcessBuilder pb;
        
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            // Windows-specific path handling for Docker Desktop
            // Convert to Docker path format (C:\path\to\dir -> /c/path/to/dir)
            String windowsPath = submissionDir;
            if (windowsPath.contains(":")) {
                char driveLetter = windowsPath.charAt(0);
                windowsPath = "/" + Character.toLowerCase(driveLetter) + 
                              windowsPath.substring(2).replace('\\', '/');
            }
            
            pb = new ProcessBuilder(
                "docker", "run", "--rm", "--network", "none",
                "--memory=" + problem.getMemoryLimitMb() + "m",
                "--cpus=0.5",
                "-v", windowsPath + ":/sandbox",
                DOCKER_IMAGE,
                "bash", "-c", "cd /sandbox && ls -la && echo 'INPUT:' && cat input.txt && echo '--- Running code ---' && (javac Main.java 2>compile_error.txt && timeout " + (problem.getTimeLimitMs()/1000) + "s java -cp /sandbox Main < /sandbox/input.txt > output.txt && cat output.txt || (cat compile_error.txt && exit 1))"
            );
            logger.debug("Windows Docker command with path: {}", windowsPath);
        } else {
            // Unix path handling
            String unixPath = submissionDir.replace("\\", "/");
            pb = new ProcessBuilder(
                "docker", "run", "--rm", "--network", "none",
                "--memory=" + problem.getMemoryLimitMb() + "m",
                "--cpus=0.5",
                "-v", unixPath + ":/sandbox",
                DOCKER_IMAGE,
                "bash", "-c", "cd /sandbox && ls -la && echo 'INPUT:' && cat input.txt && echo '--- Running code ---' && (javac Main.java 2>compile_error.txt && timeout " + (problem.getTimeLimitMs()/1000) + "s java -cp /sandbox Main < /sandbox/input.txt > output.txt && cat output.txt || (cat compile_error.txt && exit 1))"
            );
            logger.debug("Unix Docker command with path: {}", unixPath);
        }
    
        pb.redirectErrorStream(true);
    
        long startTime = System.currentTimeMillis();
        Process process = pb.start();
    
        // Add extra time for Docker container startup (5 seconds)
        boolean completed = process.waitFor(problem.getTimeLimitMs() + 5000, TimeUnit.MILLISECONDS);
        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;
        logger.debug("is Completed: {}", completed);
        if (!completed) {
            process.destroyForcibly();
            return new TestResult(Verdict.TLE, null, "Time limit exceeded", executionTime, problem.getMemoryLimitMb());
        }
    
        int exitCode = process.exitValue();
        String output = new String(process.getInputStream().readAllBytes());
    
        if (exitCode != 0 && output.contains("error:")) {
            return new TestResult(Verdict.CE, null, output, 0L, 0);
        }
    
        if (exitCode != 0) {
            return new TestResult(Verdict.RE, null, output, executionTime, problem.getMemoryLimitMb());
        }
    
        // Extract the actual output (after the "--- Running code ---" marker)
        String actualOutput = "";
        if (output.contains("--- Running code ---")) {
            actualOutput = output.substring(output.indexOf("--- Running code ---") + "--- Running code ---".length()).trim();
        } else {
            actualOutput = output.trim();
        }
        
        // Normalize expected output (remove trailing newlines but keep internal ones)
        String expectedOutput = testCase.getExpectedOutput().trim();
        
        logger.debug("Raw output: '{}'", output);
        logger.debug("Expected output: '{}', Actual output: '{}'", expectedOutput, actualOutput);
        
        // Compare normalized outputs (case-insensitive to be more forgiving)
        if (!expectedOutput.equalsIgnoreCase(actualOutput)) {
            return new TestResult(Verdict.WA, actualOutput, "Expected: '" + expectedOutput + "', Got: '" + actualOutput + "'",
                    executionTime, problem.getMemoryLimitMb());
        }
    
        return new TestResult(Verdict.AC, actualOutput, null, executionTime, problem.getMemoryLimitMb());
    }
    
    private void writeToFile(String filePath, String content) throws IOException {
        // Ensure directory exists
        File file = new File(filePath);
        File parentDir = file.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            parentDir.mkdirs();
        }
        
        // Write content to file
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            writer.write(content);
        }
        
        // Log for debugging
        logger.debug("Wrote file: {}, exists: {}, size: {}", 
                    filePath, file.exists(), file.exists() ? file.length() : 0);
    }
    
    private void deleteDirectory(File directory) {
        if (directory.exists()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        deleteDirectory(file);
                    } else {
                        file.delete();
                    }
                }
            }
            directory.delete();
        }
    }
    
    private enum Verdict {
        AC, // Accepted
        WA, // Wrong Answer
        TLE, // Time Limit Exceeded
        MLE, // Memory Limit Exceeded
        RE, // Runtime Error
        CE // Compilation Error
    }
    
    private static class TestResult {
        private final Verdict verdict;
        private final String output;
        private final String errorOutput;
        private final Long runtimeMs;
        private final Integer memoryUsedMb;
        
        public TestResult(Verdict verdict, String output, String errorOutput, Long runtimeMs, Integer memoryUsedMb) {
            this.verdict = verdict;
            this.output = output;
            this.errorOutput = errorOutput;
            this.runtimeMs = runtimeMs;
            this.memoryUsedMb = memoryUsedMb;
        }
        
        public Verdict getVerdict() {
            return verdict;
        }
        
        public String getOutput() {
            return output;
        }
        
        public String getErrorOutput() {
            return errorOutput;
        }
        
        public Long getRuntimeMs() {
            return runtimeMs;
        }
        
        public Integer getMemoryUsedMb() {
            return memoryUsedMb;
        }
    }
}
