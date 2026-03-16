import {
    Code2,
    FileCode,
    CheckCircle2,
    BarChart3,
    Eraser,
    FileText,
    Globe,
} from "lucide-react";

export const tools = [
    {
        path: "/code-reviewer",
        icon: Code2,
        title: "Code Reviewer",
        description: "Analyze GitHub repositories and get code review insights.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        path: "/script-generator",
        icon: FileCode,
        title: "Script Generator",
        description: "Generate scripts from natural language instructions.",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        path: "/grammar-checker",
        icon: CheckCircle2,
        title: "Grammar Checker",
        description: "Fix grammar and improve writing.",
        gradient: "from-green-500 to-emerald-500",
    },
    {
        path: "/data-analyst",
        icon: BarChart3,
        title: "AI Data Analyst",
        description: "Upload datasets and analyze them.",
        gradient: "from-orange-500 to-red-500",
    },
    {
        path: "/watermark-remover",
        icon: Eraser,
        title: "Watermark Remover",
        description: "Remove watermarks from images.",
        gradient: "from-yellow-500 to-orange-500",
    },
    {
        path: "/resume-builder",
        icon: FileText,
        title: "AI Resume Builder",
        description: "Create optimized resumes for job descriptions.",
        gradient: "from-indigo-500 to-purple-500",
    },
    {
        path: "/web-scraper",
        icon: Globe,
        title: "AI Web Scraper",
        description: "Extract structured data from websites.",
        gradient: "from-teal-500 to-cyan-500",
    },
];
