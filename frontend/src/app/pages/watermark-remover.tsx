import { useState, useRef } from "react";
import { Eraser, Upload, Download, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

export function WatermarkRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setPreview("");
    if (result) {
      URL.revokeObjectURL(result);
    }
    setResult("");

    // Reset the input value so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!file) {
      toast.error("Please upload an image first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/watermark/remove", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to remove watermark");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Cleanup previous result URL if it exists
      if (result) {
        URL.revokeObjectURL(result);
      }

      setResult(imageUrl);
      toast.success("Watermark removed successfully!");
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (error) {
      console.error("Removal error:", error);
      toast.error("Failed to remove watermark. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="mb-2">Watermark Remover</h1>
        <p className="text-muted-foreground">
          Remove watermarks from images using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eraser className="w-5 h-5" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Upload an image with a watermark to remove
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer relative block">
                  {preview ? (
                    <div className="relative group">
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      <button
                        onClick={handleRemoveFile}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-10"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG, or WEBP up to 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
            <Button onClick={handleRemove} disabled={loading || !file} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing Watermark...
                </>
              ) : (
                "Remove Watermark"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Processed Image</CardTitle>
              {result && (
                <a href={result} download="watermark-removed.png">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted p-4">
                  <img src={result} alt="Result" className="max-h-96 mx-auto rounded-lg" />
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <p className="text-sm text-center">
                    ✓ Watermark successfully removed
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground border rounded-lg">
                <p>Processed image will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
