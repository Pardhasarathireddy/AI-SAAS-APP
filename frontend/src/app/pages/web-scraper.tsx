import { useState } from "react";
import { Globe, Copy, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

export function WebScraper() {
  const [url, setUrl] = useState("");
  const [dataType, setDataType] = useState("text");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScrape = async () => {
    if (!url) {
      toast.error("Please enter a URL first");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/scrape/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url, selectors: "default" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to scrape data");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Data scraped successfully!");
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (error: any) {
      console.error("Scraping error:", error);
      toast.error(error.message || "Failed to scrape data");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const jsonData = JSON.stringify(result.data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scraped-data.json";
    a.click();
    toast.success("Data exported!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="mb-2">AI Web Scraper</h1>
        <p className="text-muted-foreground">
          Extract structured data from any website
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Scraping Configuration
          </CardTitle>
          <CardDescription>
            Enter the website URL and select what data to extract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataType">Data to Extract</Label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger id="dataType">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="links">Links</SelectItem>
                <SelectItem value="images">Images</SelectItem>
                <SelectItem value="articles">Articles</SelectItem>
                <SelectItem value="products">Products</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleScrape} disabled={loading} className="w-full md:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              "Start Scraping"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scraped Data</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Copied to clipboard!")}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy JSON
                </Button>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <CardDescription>
              Scraped from: {result.url}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-2">
                Found {result.data.length} items • {new Date(result.scrapedAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              {result.data.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {item.link}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
