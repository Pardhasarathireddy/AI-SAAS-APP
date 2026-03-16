import { useState } from "react";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

export function GrammarChecker() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCheck = async () => {
    if (!text) {
      toast.error("Please enter some text first");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/grammar/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to check grammar");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Grammar check completed!");
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (error: any) {
      console.error("Grammar error:", error);
      toast.error(error.message || "Failed to check grammar");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.correctedText);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="mb-2">Grammar Checker</h1>
        <p className="text-muted-foreground">
          Fix grammar and improve your writing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Your Text
            </CardTitle>
            <CardDescription>
              Enter or paste the text you want to check
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text to Check</Label>
              <Textarea
                id="text"
                placeholder="Enter your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
              />
            </div>
            <Button onClick={handleCheck} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Grammar"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Corrected Text</CardTitle>
              {result && (
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{result.score}%</div>
                    <p className="text-sm text-muted-foreground">Writing Quality Score</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Corrected Text</Label>
                  <div className="p-4 rounded-lg border bg-muted min-h-[200px]">
                    <p className="whitespace-pre-wrap">{result.correctedText}</p>
                  </div>
                </div>

                {result.corrections.length > 0 && (
                  <div className="space-y-3">
                    <Label>Corrections Made</Label>
                    {result.corrections.map((correction: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{correction.type}</Badge>
                        </div>
                        <p className="text-sm">
                          <span className="line-through text-muted-foreground">{correction.original}</span>
                          {" → "}
                          <span className="text-green-500 font-medium">{correction.correction}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Results will appear here after checking</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
