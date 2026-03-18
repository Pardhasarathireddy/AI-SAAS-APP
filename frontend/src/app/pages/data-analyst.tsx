import { useState, useRef } from "react";
import { BarChart3, Upload, Download, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

const mockData = [
  { month: "Jan", sales: 4000, revenue: 2400 },
  { month: "Feb", sales: 3000, revenue: 1398 },
  { month: "Mar", sales: 2000, revenue: 9800 },
  { month: "Apr", sales: 2780, revenue: 3908 },
  { month: "May", sales: 1890, revenue: 4800 },
  { month: "Jun", sales: 2390, revenue: 3800 },
];

const pieData = [
  { name: 'Electronics', value: 400 },
  { name: 'Clothing', value: 300 },
  { name: 'Home & Garden', value: 300 },
  { name: 'Sports', value: 200 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function DataAnalyst() {
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (query.trim()) {
        formData.append("query", query);
      }

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/data-analyst/analyze", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze data");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Analysis completed!");
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="mb-2">AI Data Analyst</h1>
        <p className="text-muted-foreground">
          Upload datasets and get AI-powered analysis
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Upload Dataset
          </CardTitle>
          <CardDescription>
            Upload a CSV or Excel file for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Dataset File (CSV, XLSX)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
              <input
                id="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer block w-full h-full">
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-primary" />
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-10"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-medium mb-1">{file.name}</p>
                    <p className="text-xs text-muted-foreground">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">
                      CSV or Excel files up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="query">Analysis Query (Optional)</Label>
            <textarea
              id="query"
              placeholder="E.g., Identify monthly sales trends and our top 3 performing products..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading || !file} className="w-full md:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Data"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (() => {
        const xAxisKey = result.charts?.xAxisKey || "month";
        const metrics = result.charts?.metrics || ["sales", "revenue"];
        const chartData = result.charts?.mockData?.length > 0 ? result.charts.mockData : mockData;
        const pieChartData = result.charts?.pieData?.length > 0 ? result.charts.pieData : pieData;

        return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analysis Results</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Summary Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Dataset Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground mb-1">Total Rows</p>
                  <p className="text-2xl font-bold">{result.summary.totalRows.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground mb-1">Total Columns</p>
                  <p className="text-2xl font-bold">{result.summary.totalColumns}</p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground mb-1">Missing Values</p>
                  <p className="text-2xl font-bold">{result.summary.missingValues}</p>
                </div>
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Key AI Insights</h3>
              <div className="grid grid-cols-1 gap-3">
                {result.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card flex items-start gap-3 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium">{idx + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Visual Analytics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Revenue vs Sales Area Chart */}
                <div className="p-4 rounded-xl border bg-card shadow-sm">
                  <h3 className="mb-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Trend Analysis</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend iconType="circle" />
                        <Area type="monotone" name={metrics[0]} dataKey={metrics[0]} stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                        <Area type="monotone" name={metrics[1] || "Metric 2"} dataKey={metrics[1] || "revenue"} stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Category Breakdown Pie Chart */}
                <div className="p-4 rounded-xl border bg-card shadow-sm">
                  <h3 className="mb-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Distribution</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieChartData.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 3: Monthly Performance Bar Chart */}
                <div className="p-4 rounded-xl border bg-card shadow-sm lg:col-span-2">
                  <h3 className="mb-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Comparative Analytics</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={30}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} />
                        <Tooltip 
                          cursor={{ fill: 'var(--muted)' }}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend iconType="circle" />
                        <Bar name={metrics[0]} dataKey={metrics[0]} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar name={metrics[1] || "Metric 2"} dataKey={metrics[1] || "revenue"} fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )})()}
    </div>
  );
}
