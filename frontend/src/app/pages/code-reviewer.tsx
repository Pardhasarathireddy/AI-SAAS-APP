import { useState } from "react";
import { Code2, Copy, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

export function CodeReviewer() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleReview = async () => {
    if (!repoUrl) { // Changed from `!url` to `!repoUrl` to maintain syntactic correctness
      toast.error("Please enter a repository URL");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/code-review/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ repoUrl: repoUrl }), // Changed from `repoUrl: url` to `repoUrl: repoUrl` to maintain syntactic correctness
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze code");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Code review completed!");
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error(error.message || "Failed to analyze code");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="mb-2">Code Reviewer</h1>
        <p className="text-muted-foreground">
          Analyze GitHub repositories and get comprehensive code review insights
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Repository URL
          </CardTitle>
          <CardDescription>
            Enter the GitHub repository URL you want to analyze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">GitHub Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleReview} disabled={loading} className="w-full md:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Repository"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Review Results</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{result.score}/10</div>
                    <p className="text-muted-foreground">Overall Code Quality Score</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="issues" className="space-y-3">
                {result.issues.map((issue: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={issue.severity === "high" ? "destructive" : "secondary"}>
                        {issue.severity}
                      </Badge>
                      <code className="text-xs text-muted-foreground">Line {issue.line}</code>
                    </div>
                    <p className="font-medium mb-1">{issue.file}</p>
                    <p className="text-sm text-muted-foreground">{issue.message}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-3">
                {result.suggestions.map((suggestion: string, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium">{idx + 1}</span>
                    </div>
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
