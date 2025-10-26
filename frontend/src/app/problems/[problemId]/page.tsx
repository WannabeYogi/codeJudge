"use client";

import { AlertCircle, CheckCircle, Clock, Loader2, Play, User, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Problem, SubmissionResponse, apiService } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import UserRegistration from "@/components/user-registration";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_JAVA_CODE = `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`;

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const problemId = params.problemId as string;
  const contestId = searchParams.get('contestId');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState(DEFAULT_JAVA_CODE);
  const [language, setLanguage] = useState("java");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const { toast } = useToast();

  // Get the user info from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    
    if (storedUserId && storedUsername) {
      setUserId(storedUserId);
      setUsername(storedUsername);
    }

    // Listen for storage changes (for when user logs in/out in another tab)
    const handleStorageChange = () => {
      const currentUserId = localStorage.getItem('userId');
      const currentUsername = localStorage.getItem('username');
      setUserId(currentUserId);
      setUsername(currentUsername);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchProblemDetails = async () => {
      if (!contestId) {
        toast({
          title: "Error",
          description: "Contest ID is missing. Please select a problem from a contest.",
          variant: "destructive",
        });
        router.push('/contests');
        return;
      }

      try {
        setLoading(true);
        const contestDetails = await apiService.getContestDetails(contestId);
        const foundProblem = contestDetails.problems.find(p => p.id === problemId);
        
        if (foundProblem) {
          setProblem(foundProblem);
        } else {
          toast({
            title: "Error",
            description: "Problem not found in this contest.",
            variant: "destructive",
          });
          router.push(`/contests/${contestId}`);
        }
      } catch (error) {
        console.error("Failed to fetch problem details:", error);
        toast({
          title: "Error",
          description: "Failed to load problem details. Please try again later.",
          variant: "destructive",
        });
        router.push('/contests');
      } finally {
        setLoading(false);
      }
    };

    fetchProblemDetails();
  }, [problemId, contestId, toast, router]);

  const handleSubmit = async () => {
    if (!contestId) {
      toast({
        title: "Error",
        description: "Contest ID is missing. Cannot submit the solution.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is registered
    const currentUserId = localStorage.getItem('userId');
    const currentUsername = localStorage.getItem('username');
    
    if (!currentUserId || !currentUsername) {
      setShowUserDialog(true);
      toast({
        title: "Registration Required",
        description: "Please register with a username before submitting code.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setSubmission(null);
      
      const response = await apiService.submitCode({
        userId: currentUserId,
        contestId: contestId,
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
          
          toast({
            title: "Error",
            description: "Failed to get submission status. Please check the submissions tab later.",
            variant: "destructive",
          });
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to submit code:", error);
      toast({
        title: "Error",
        description: "Failed to submit your code. Please try again later.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
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
          <p className="text-muted-foreground">Problem not found. Redirecting...</p>
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
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
              
              {username ? (
                <div className="text-sm flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{username}</span>
                </div>
              ) : (
                <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Register
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <UserRegistration />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
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