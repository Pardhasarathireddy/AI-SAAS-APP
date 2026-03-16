import { useState, useRef } from "react";
import { FileText, Upload, Download, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

export function ResumeBuilder() {
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription || !skills) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      formData.append("skills", skills);
      formData.append("summary", summary);
      if (file) {
        formData.append("resume", file);
      }

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/resume/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate resume");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Resume generated successfully!");
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="mb-2">AI Resume Builder</h1>
        <p className="text-muted-foreground">
          Create optimized resumes tailored to job descriptions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume Details
            </CardTitle>
            <CardDescription>
              Enter your information and job requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job">Job Description *</Label>
              <Textarea
                id="job"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated) *</Label>
              <Input
                id="skills"
                placeholder="React, Node.js, TypeScript, AWS..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary (optional)</Label>
              <Textarea
                id="summary"
                placeholder="Brief summary of your professional background..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload">Upload Existing Resume (optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  id="upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <label htmlFor="upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">Resume uploaded</p>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                        title="Remove file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload PDF or DOC</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Resume"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resume Preview</CardTitle>
              {result && (
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6 p-6 bg-white text-black rounded-lg border">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold mb-1">{result.name}</h2>
                  <p className="text-lg text-gray-600 mb-2">{result.title}</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{result.email}</span>
                    <span>{result.phone}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Professional Summary</h3>
                  <p className="text-sm text-gray-700">{result.summary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Experience</h3>
                  {result.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-4">
                      <h4 className="font-semibold">{exp.position}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {exp.company} • {exp.period}
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {exp.achievements.map((achievement: string, i: number) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground border rounded-lg">
                <p>Resume preview will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
