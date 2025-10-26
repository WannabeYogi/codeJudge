"use client";

import { AlertCircle, CheckCircle, Clock, Loader2, Play, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Problem, SAMPLE_CONTEST_ID, SAMPLE_USER_ID, SubmissionResponse, apiService } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_JAVA_CODE = `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`;

export default function ProblemPage() {
  const params = useParams();
  const problemId = params.problemId as string;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState(DEFAULT_JAVA_CODE);
  const [language, setLanguage] = useState("java");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch the problem details
        // For now, we'll use the contest details API and find the problem
        const contestDetails = await apiService.getContestDetails(SAMPLE_CONTEST_ID);
        const foundProblem = contestDetails.problems.find(p => p.id === problemId);
        
        if (foundProblem) {
          setProblem(foundProblem);
        }
      } catch (error) {
        console.error("Failed to fetch problem details:", error);
        toast({
          title: "Error",
          description: "Failed to load problem details. Using mock data instead.",
          variant: "destructive",
        });
        
        // Provide mock data when API fails
        // Find the problem ID in our mock data
        const mockProblems = [
          {
            id: "68fdb9efd102435f3b037f7c",
            title: "Hello World",
            description: "Print 'Hello, World!' to the console.",
            timeLimitMs: 1000,
            memoryLimitMb: 128
          },
          {
            id: "68fdb9efd102435f3b037f7d",
            title: "Sum of Two Numbers",
            description: "Given two integers A and B, return their sum.",
            timeLimitMs: 1000,
            memoryLimitMb: 128
          },
          {
            id: "68fdb9efd102435f3b037f7e",
            title: "Factorial",
            description: "Calculate the factorial of a given number N.",
            timeLimitMs: 1000,
            memoryLimitMb: 128
          }
        ];
        
        const mockProblem = mockProblems.find(p => p.id === problemId) || mockProblems[0];
        setProblem(mockProblem);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemDetails();
  }, [problemId, toast]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmission(null);
      
      try {
        const response = await apiService.submitCode({
          userId: SAMPLE_USER_ID,
          contestId: SAMPLE_CONTEST_ID,
          problemId,
          language,
          code
        });
        
        toast({
          title: "Submission sent",
          description: "Your code is being evaluated.",
        });
        
        // Poll for submission status
        const pollInterval = setInterval(async () => {
          try {
            const submissionStatus = await apiService.getSubmission(response.submissionId);
            setSubmission(submissionStatus);
            
            if (submissionStatus.status !== 'PENDING' && submissionStatus.status !== 'RUNNING') {
              clearInterval(pollInterval);
              setSubmitting(false);
            }
          } catch (error) {
            console.error("Failed to fetch submission status:", error);
            clearInterval(pollInterval);
            setSubmitting(false);
            
            // Provide mock submission data
            simulateMockSubmission();
          }
        }, 2000);
      } catch (error) {
        console.error("Failed to submit code to API:", error);
        toast({
          title: "Demo Mode",
          description: "Using mock submission data since the backend is not available.",
        });
        
        // Simulate a submission with mock data
        simulateMockSubmission();
      }
    } catch (error) {
      console.error("Failed to submit code:", error);
      toast({
        title: "Error",
        description: "Failed to submit your code. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };
  
  // Function to simulate a submission with mock data
  const simulateMockSubmission = () => {
    // First set to pending
    setSubmission({
      id: "mock-submission-" + Date.now(),
      userId: SAMPLE_USER_ID,
      problemId: problemId,
      status: 'PENDING',
      verdict: null,
      runtimeMs: null,
      memoryUsedMb: null,
      output: null,
      errorLog: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // After 1 second, set to running
    setTimeout(() => {
      setSubmission(prev => ({
        ...prev!,
        status: 'RUNNING',
        updatedAt: new Date().toISOString()
      }));
      
      // After 2 more seconds, set the final result
      setTimeout(() => {
        // Check if the code contains the expected output for the problem
        let status: 'ACCEPTED' | 'WRONG_ANSWER' | 'CE';
        let verdict: string;
        let output: string | null = null;
        let errorLog: string | null = null;
        
        if (code.includes("System.out.println(\"Hello, World!\")") && problemId === "68fdb9efd102435f3b037f7c") {
          status = 'ACCEPTED';
          verdict = "Accepted";
          output = "Hello, World!";
        } else if (code.includes("System.out.println(a + b)") && problemId === "68fdb9efd102435f3b037f7d") {
          status = 'ACCEPTED';
          verdict = "Accepted";
          output = "5";
        } else if (code.includes("factorial") && problemId === "68fdb9efd102435f3b037f7e") {
          status = 'ACCEPTED';
          verdict = "Accepted";
          output = "120";
        } else if (code.includes("System.out.print")) {
          status = 'WRONG_ANSWER';
          verdict = "Wrong Answer";
          output = "Your output doesn't match the expected output";
        } else {
          status = 'CE';
          verdict = "Compilation Error";
          errorLog = "Cannot find symbol\n  symbol:   method someUndefinedMethod()\n  location: class Main";
        }
        
        setSubmission(prev => ({
          ...prev!,
          status: status,
          verdict: verdict,
          runtimeMs: 42,
          memoryUsedMb: 24,
          output: output,
          errorLog: errorLog,
          updatedAt: new Date().toISOString()
        }));
        
        setSubmitting(false);
      }, 2000);
    }, 1000);
  };

  const getStatusIcon = () => {
    if (!submission) return null;
    
    switch (submission.status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'RUNNING':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'WRONG_ANSWER':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container py-10">
        <div className="text-center py-10">
          <p className="text-muted-foreground">Problem not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Problem Description */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{problem.title}</CardTitle>
              <CardDescription>
                Time Limit: {problem.timeLimitMs}ms | Memory Limit: {problem.memoryLimitMb}MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p>{problem.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Editor */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>

          <div className="border rounded-md h-[500px] overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="java"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Submission Status */}
          {submission && (
            <Card className="mt-4">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Submission Result</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className={`font-medium ${
                      submission.status === 'ACCEPTED' ? 'text-green-500' : 
                      submission.status === 'WRONG_ANSWER' ? 'text-red-500' : 
                      submission.status === 'PENDING' ? 'text-yellow-500' : 
                      submission.status === 'RUNNING' ? 'text-blue-500' : 'text-orange-500'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-0">
                {submission.verdict && (
                  <p className="text-sm mb-2">
                    <span className="font-medium">Verdict:</span> {submission.verdict}
                  </p>
                )}
                {submission.runtimeMs !== null && (
                  <p className="text-sm mb-2">
                    <span className="font-medium">Runtime:</span> {submission.runtimeMs} ms
                  </p>
                )}
                {submission.memoryUsedMb !== null && (
                  <p className="text-sm mb-2">
                    <span className="font-medium">Memory:</span> {submission.memoryUsedMb} MB
                  </p>
                )}
                {submission.output && (
                  <div className="mt-4">
                    <p className="font-medium text-sm mb-1">Output:</p>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-32">
                      {submission.output}
                    </pre>
                  </div>
                )}
                {submission.errorLog && (
                  <div className="mt-4">
                    <p className="font-medium text-sm mb-1 text-red-500">Error:</p>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-32 text-red-500">
                      {submission.errorLog}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
