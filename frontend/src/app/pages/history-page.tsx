import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Clock,
    ArrowLeft,
    MessageSquare,
    ChevronRight,
    FileText,
    Code2,
    BarChart3,
    Image as ImageIcon,
    CheckCircle2,
    FileCode,
    Globe,
    Loader2,
    Trash2,
    Download
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
// import { cn } from "../components/ui/utils";
import { useAuth } from "../../context/AuthContext";

const modelInfo: Record<string, { title: string; icon: any; color: string; toolRoute: string }> = {
    "code-reviewer": { title: "Code Review History", icon: Code2, color: "text-blue-500", toolRoute: "/code-reviewer" },
    "script-generator": { title: "Script Generation History", icon: FileCode, color: "text-purple-500", toolRoute: "/script-generator" },
    "grammar-checker": { title: "Grammar Check History", icon: CheckCircle2, color: "text-green-500", toolRoute: "/grammar-checker" },
    "data-analyst": { title: "Data Analysis History", icon: BarChart3, color: "text-orange-500", toolRoute: "/data-analyst" },
    "watermark-remover": { title: "Watermark Removal History", icon: ImageIcon, color: "text-pink-500", toolRoute: "/watermark-remover" },
    "resume-builder": { title: "Resume Builder History", icon: FileText, color: "text-indigo-500", toolRoute: "/resume-builder" },
    "web-scraper": { title: "Web Scraping History", icon: Globe, color: "text-cyan-500", toolRoute: "/web-scraper" },
};

const analyzeScore = (text: string) => {
    if (!text) return 100;

    // Isolate the text purely inside the Critical Issues section, ignoring the header itself
    const issuesMatch = text.match(/### ⚠️ Critical Issues([\s\S]*?)### 💡 Recommendations/);
    if (!issuesMatch) return 90;

    const issuesText = issuesMatch[1].trim();

    // If the AI said none, N/A, or nothing was written, it's perfect
    if (!issuesText || issuesText.toLowerCase().match(/none|n\/a|no critical|looks good/i)) {
        return 100;
    }

    const bulletCount = (issuesText.match(/^[-*]/gm) || []).length;
    const penalty = bulletCount > 0 ? bulletCount * 15 : 20;

    return Math.max(30, 100 - penalty);
};

export function HistoryPage() {
    const { model, id } = useParams<{ model: string; id?: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const info = model ? modelInfo[model] : null;

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user || !model) return;

            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5000/api/auth/history", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Filter by model and sort by date desc
                    const filtered = data
                        .filter((item: any) => item.model === model)
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setHistory(filtered);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, model]);

    useEffect(() => {
        if (!loading && id && history.length > 0) {
            const element = document.getElementById(`history-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [loading, id, history]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this history item?")) return;

        setDeletingId(id);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/auth/history/${id}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setHistory(prev => prev.filter(item => item._id !== id));
                toast.success("History item deleted successfully");
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to delete history item");
            }
        } catch (error: any) {
            console.error("Delete error:", error);
            toast.error(error.message || "Failed to delete history item");
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `processed-${filename || 'image.png'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success("Download started");
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download image");
        }
    };

    if (!info) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <h2 className="text-2xl font-semibold">Model not found</h2>
                <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
            </div>
        );
    }

    // const Icon = info.icon;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(info.toolRoute)}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{info.title}</h1>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Recorded Sessions</p>
                    <p className="text-2xl font-bold">{history.length}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Loading your history...</p>
                </div>
            ) : history.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                            <Clock className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-medium">No history yet</h3>
                            <p className="text-muted-foreground">You haven't used this tool successfully yet.</p>
                        </div>
                        <Button onClick={() => navigate(info.toolRoute)}>Try {info.title.split(' ')[0]} Now</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {history.map((item, idx) => (
                        <Card key={item._id || idx} id={`history-${item._id}`} className="group hover:border-primary/50 transition-all duration-300 overflow-hidden scroll-mt-24">
                            <CardHeader className="bg-accent/30 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-semibold">
                                            {new Date(item.createdAt).toLocaleString(undefined, {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                                            ID: {item._id?.slice(-8) || idx}
                                            <ChevronRight className="w-3 h-3" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(item._id)}
                                            disabled={deletingId === item._id}
                                        >
                                            {deletingId === item._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {model === 'watermark-remover' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                                            {/* Original Image */}
                                            <div className="flex flex-col space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    Original
                                                </h4>
                                                <div className="bg-accent/40 rounded-xl p-4 border border-border/50 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-3 mb-4 h-10">
                                                        <div className="p-2 rounded-lg bg-card border shadow-sm shrink-0">
                                                            <ImageIcon className="w-4 h-4" />
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-sm font-medium truncate">{item.userInputs?.filename || "Original Image"}</p>
                                                            <p className="text-[10px] text-muted-foreground">Uploaded Image</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        {item.userInputs?.url && (
                                                            <div className="relative aspect-video rounded-lg overflow-hidden border bg-black/50">
                                                                <img src={item.userInputs.url} alt="Original" className="w-full h-full object-contain" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Processed Image */}
                                            <div className="flex flex-col space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Result
                                                </h4>
                                                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 shadow-inner flex-1 flex flex-col">
                                                    <div className="flex items-center gap-3 mb-4 h-10">
                                                        <div className="p-2 rounded-lg bg-card border shadow-sm shrink-0">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-green-600 dark:text-green-500">Success</p>
                                                            <p className="text-[10px] text-muted-foreground">Watermark Removed</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        {item.response?.url && (
                                                            <div className="relative aspect-video rounded-lg overflow-hidden border bg-black/50 group-hover:border-primary/30 transition-colors">
                                                                <img src={item.response.url} alt="Processed" className="w-full h-full object-contain" />
                                                                <div className="absolute top-2 right-2 flex gap-2">
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        className="h-7 px-2 text-[10px] bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-md flex items-center gap-1.5"
                                                                        onClick={() => handleDownload(item.response.url, item.userInputs?.filename)}
                                                                    >
                                                                        <Download className="w-3 h-3" />
                                                                        Download
                                                                    </Button>
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        className="h-7 px-2 text-[10px] bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-md"
                                                                        onClick={() => window.open(item.response.url, '_blank')}
                                                                    >
                                                                        View Full
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* User Input Section */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                Your Input
                                            </h4>
                                            <div className="bg-accent/40 rounded-xl p-4 border border-border/50">
                                                {model === 'data-analyst' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-card border shadow-sm">
                                                            <BarChart3 className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{item.userInputs?.filename || "Uploaded File"}</p>
                                                            <p className="text-xs text-muted-foreground">{(item.userInputs?.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                ) : model === 'code-reviewer' ? (
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-mono break-all text-primary">{item.userInputs?.repoUrl}</p>
                                                        <p className="text-xs text-muted-foreground">Repository analyzed</p>
                                                    </div>
                                                ) : model === 'script-generator' ? (
                                                    <div className="space-y-1">
                                                        <p className="text-sm italic">"{item.userInputs?.prompt}"</p>
                                                        <p className="text-xs text-muted-foreground font-semibold text-purple-400">Language: {item.userInputs?.language}</p>
                                                    </div>
                                                ) : model === 'grammar-checker' ? (
                                                    <p className="text-sm leading-relaxed truncate-3-lines">{item.userInputs?.textLength} characters analyzed</p>
                                                ) : model === 'resume-builder' ? (
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium line-clamp-2">{item.userInputs?.jobDescription}</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {item.userInputs?.skills?.split(',').map((skill: string, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 rounded-md bg-accent text-[10px] border">{skill.trim()}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <pre className="text-xs overflow-x-auto p-2 bg-black/20 rounded">
                                                        {JSON.stringify(item.userInputs, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>

                                        {/* AI Result Section */}
                                        <div className="space-y-3 mt-6">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                AI Response
                                            </h4>
                                            <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 shadow-inner">
                                                {model === 'script-generator' ? (
                                                    <div className="relative group/code">
                                                        <pre className="text-xs font-mono bg-slate-950 p-4 rounded-lg overflow-x-auto text-slate-300 border border-border shadow-md max-h-60">
                                                            <code>{item.response?.scriptLength > 0 ? "// Generated script hidden for brevity. Open tool to re-run." : "Successfully generated script."}</code>
                                                        </pre>
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                            <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => navigate(info.toolRoute)}>Use Again</Button>
                                                        </div>
                                                    </div>
                                                ) : model === 'code-reviewer' ? (
                                                    <div className="space-y-4">
                                                        {item.response?.reports ? (
                                                            <>
                                                                <div className="h-[250px] w-full max-w-sm mx-auto mb-4 border border-primary/20 bg-black/20 rounded-xl overflow-hidden shadow-inner">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                                                            { subject: 'Security', score: analyzeScore(item.response.reports.security), fullMark: 100 },
                                                                            { subject: 'Performance', score: analyzeScore(item.response.reports.performance), fullMark: 100 },
                                                                            { subject: 'Architecture', score: analyzeScore(item.response.reports.architecture), fullMark: 100 },
                                                                            { subject: 'Quality', score: analyzeScore(item.response.reports.quality), fullMark: 100 },
                                                                            { subject: 'Docs', score: analyzeScore(item.response.reports.documentation), fullMark: 100 },
                                                                            { subject: 'Dependencies', score: analyzeScore(item.response.reports.dependencies), fullMark: 100 },
                                                                            { subject: 'Practices', score: analyzeScore(item.response.reports.bestPractices), fullMark: 100 },
                                                                        ]}>
                                                                            <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                                                                            <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))", fontSize: 9 }} />
                                                                            <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                                                                        </RadarChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                                <Tabs defaultValue="security" className="w-full">
                                                                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-1 mb-2 gap-1 bg-black/20">
                                                                        <TabsTrigger value="security" className="py-1 text-[10px]">Sec</TabsTrigger>
                                                                        <TabsTrigger value="performance" className="py-1 text-[10px]">Perf</TabsTrigger>
                                                                        <TabsTrigger value="architecture" className="py-1 text-[10px]">Arch</TabsTrigger>
                                                                        <TabsTrigger value="quality" className="py-1 text-[10px]">Qual</TabsTrigger>
                                                                        <TabsTrigger value="documentation" className="py-1 text-[10px]">Docs</TabsTrigger>
                                                                        <TabsTrigger value="dependencies" className="py-1 text-[10px]">Deps</TabsTrigger>
                                                                        <TabsTrigger value="bestPractices" className="py-1 text-[10px]">Best</TabsTrigger>
                                                                    </TabsList>
                                                                    {['security', 'performance', 'architecture', 'quality', 'documentation', 'dependencies', 'bestPractices'].map(tab => (
                                                                        <TabsContent key={tab} value={tab} className="space-y-4">
                                                                            <div className="prose prose-sm prose-invert max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-h3:text-primary prose-h3:font-bold prose-h3:border-b prose-h3:border-primary/20 prose-h3:pb-1 prose-h3:mt-4 first:prose-h3:mt-0 prose-strong:text-cyan-400 overflow-y-auto max-h-60 p-4 rounded-xl bg-card/50 border shadow-inner">
                                                                                <ReactMarkdown>{item.response.reports[tab] || '*No data recorded*'}</ReactMarkdown>
                                                                            </div>
                                                                        </TabsContent>
                                                                    ))}
                                                                </Tabs>
                                                            </>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">Legacy report data missing.</p>
                                                        )}
                                                    </div>
                                                ) : model === 'grammar-checker' ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-semibold">Grammar Score</span>
                                                            <span className="text-xs font-bold text-green-500">{item.response?.score}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                                                            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${item.response?.score}%` }}></div>
                                                        </div>
                                                        <p className="text-sm italic text-muted-foreground line-clamp-3">"{item.response?.correctedText}"</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm font-medium">Results processed successfully</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
