import { useState } from "react";
import { Code2, Copy, Loader2, Shield, Activity, Cpu, CheckCircle, FileText, Package, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
// import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

const analyzeScore = (text: string) => {
  if (!text) return 100;

  // Isolate the text purely inside the Critical Issues section, ignoring the header itself
  const issuesMatch = text.match(/### ⚠️ Critical Issues([\s\S]*?)### 💡 Recommendations/);
  if (!issuesMatch) return 90; // Fallback if format was mangled

  const issuesText = issuesMatch[1].trim();

  // If the AI said none, N/A, or nothing was written, it's perfect
  if (!issuesText || issuesText.toLowerCase().match(/none|n\/a|no critical|looks good/i)) {
    return 100;
  }

  // Count only bullet points strictly inside the issues section
  const bulletCount = (issuesText.match(/^[-*]/gm) || []).length;

  // Subtract 15 points per critical bullet found.
  const penalty = bulletCount > 0 ? bulletCount * 15 : 20;

  return Math.max(30, 100 - penalty);
};

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
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="mb-2">Multi-Agent Code Reviewer</h1>
        <p className="text-muted-foreground">
          Powered by LangChain & Groq: 7 Parallel Agents evaluating your GitHub repository
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
                7 AI Agents Analyzing Source Code...
              </>
            ) : (
              "Analyze Repository"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && result.reports && (
        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-xl">Repository Health Radar</CardTitle>
              <CardDescription>Visual breakdown of the code review parameters based on AI severity mappings</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: 'Security', score: analyzeScore(result.reports.security), fullMark: 100 },
                    { subject: 'Performance', score: analyzeScore(result.reports.performance), fullMark: 100 },
                    { subject: 'Architecture', score: analyzeScore(result.reports.architecture), fullMark: 100 },
                    { subject: 'Quality', score: analyzeScore(result.reports.quality), fullMark: 100 },
                    { subject: 'Documentation', score: analyzeScore(result.reports.documentation), fullMark: 100 },
                    { subject: 'Dependencies', score: analyzeScore(result.reports.dependencies), fullMark: 100 },
                    { subject: 'Practices', score: analyzeScore(result.reports.bestPractices), fullMark: 100 },
                  ]}>
                    <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/20">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Comprehensive Review Results</CardTitle>
                  <CardDescription className="mt-1">
                    Analysis completed in {(result.metadata?.analysisTimeMs / 1000).toFixed(1)} seconds
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="security" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-1 pb-2 mb-6 gap-1 md:gap-2 bg-muted/50">
                  <TabsTrigger value="security" className="py-3 flex flex-col items-center gap-2 data-[state=active]:bg-card"><Shield className="w-4 h-4 text-red-500" /> <span className="text-xs">Security</span></TabsTrigger>
                  <TabsTrigger value="performance" className="py-3 flex flex-col items-center gap-2 data-[state=active]:bg-card"><Activity className="w-4 h-4 text-orange-500" /> <span className="text-xs">Performance</span></TabsTrigger>
                  <TabsTrigger value="architecture" className="py-3 flex flex-col items-center gap-2 data-[state=active]:bg-card"><Cpu className="w-4 h-4 text-blue-500" /> <span className="text-xs">Architecture</span></TabsTrigger>
                  <TabsTrigger value="quality" className="py-3 flex flex-col items-center gap-2 data-[state=active]:bg-card"><CheckCircle className="w-4 h-4 text-green-500" /> <span className="text-xs">Code Quality</span></TabsTrigger>
                  <TabsTrigger value="documentation" className="py-3 flex flex-col items-center gap-2 data-[state=active]:bg-card"><FileText className="w-4 h-4 text-gray-500" /> <span className="text-xs">Documentation</span></TabsTrigger>
                  <TabsTrigger value="dependencies" className="py-3 flex flex-col items-center gap-2 data-[state=active]:bg-card"><Package className="w-4 h-4 text-purple-500" /> <span className="text-xs">Dependencies</span></TabsTrigger>
                  <TabsTrigger value="bestPractices" className="py-3 flex flex-col items-center gap-2 data-[state=active]:bg-card"><Star className="w-4 h-4 text-yellow-500" /> <span className="text-xs">Best Practices</span></TabsTrigger>
                </TabsList>

                {/* Tabs Rendering */}
                {['security', 'performance', 'architecture', 'quality', 'documentation', 'dependencies', 'bestPractices'].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-4">
                    <div className="prose prose-sm md:prose-base prose-invert max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-h3:text-primary prose-h3:font-bold prose-h3:border-b prose-h3:border-primary/20 prose-h3:pb-2 prose-h3:mt-8 first:prose-h3:mt-0 prose-strong:text-cyan-400 p-6 rounded-xl bg-card/50 border shadow-inner">
                      <ReactMarkdown>{result.reports[tab as keyof typeof result.reports]}</ReactMarkdown>
                    </div>
                  </TabsContent>
                ))}

              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
