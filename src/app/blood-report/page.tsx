"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCcw,
  ArrowUp,
  ArrowDown,
  Activity,
  FileType,
  Printer,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeBloodReport, BloodReportOutput } from "@/ai/flows/blood-report-analysis";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function BloodReportPage() {
  const { toast } = useToast();

  const [reportText, setReportText] = useState("");
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BloodReportOutput | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfjsRef = useRef<any>(null);
  const mammothRef = useRef<any>(null);

  /* ===============================
     SAFE CLIENT-ONLY LIB LOADING
     =============================== */
  useEffect(() => {
    const loadLibs = async () => {
      try {
        const [pdfjs, mammoth] = await Promise.all([
          import("pdfjs-dist/legacy/build/pdf"),
          import("mammoth"),
        ]);

        const pdfModule = pdfjs?.default || pdfjs;

        pdfModule.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfModule.version}/pdf.worker.min.js`;

        pdfjsRef.current = pdfModule;
        mammothRef.current = mammoth;
      } catch (err) {
        console.error("Failed to load document libraries:", err);
      }
    };

    loadLibs();
  }, []);

  /* =============================== */
  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    if (!pdfjsRef.current) throw new Error("PDF library not loaded");

    const pdf = await pdfjsRef.current.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(" ") + "\n";
    }

    return fullText;
  };

  /* =============================== */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReportPhoto(reader.result as string);
          setReportText("");
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(arrayBuffer);
        setReportText(text);
        setReportPhoto(null);
        setIsLoading(false);
      } else if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        if (!mammothRef.current) throw new Error("Word library not loaded");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammothRef.current.extractRawText({ arrayBuffer });
        setReportText(result.value);
        setReportPhoto(null);
        setIsLoading(false);
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported File",
          description: "Upload JPG, PNG, PDF, or DOCX.",
        });
        setFileName(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("File processing error:", error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "File may be corrupted or unsupported.",
      });
      setFileName(null);
      setIsLoading(false);
    }
  };

  /* =============================== */
  const handleAnalysis = async () => {
    if (!reportText.trim() && !reportPhoto) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Upload report or paste results.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await analyzeBloodReport({
        reportText: reportText || undefined,
        reportPhotoDataUri: reportPhoto || undefined,
      });

      setAnalysis(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not process report.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setReportText("");
    setReportPhoto(null);
    setFileName(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePrint = () => window.print();

  /* =============================== */
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center gap-3 mb-8 print:hidden">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Blood Report Analyzer
          </h1>
          <p className="text-muted-foreground">
            Get instant AI insights from lab results.
          </p>
        </div>
      </div>

      {!analysis ? (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload Report</CardTitle>
              <CardDescription>JPG, PNG, PDF, DOCX supported</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.docx"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              {fileName && <p className="mt-3 text-sm">{fileName}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Or Paste Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste report text here..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center mt-6">
            <Button size="lg" onClick={handleAnalysis} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start AI Interpretation"
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          <Alert className="mb-6 print:hidden">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Medical Disclaimer</AlertTitle>
            <AlertDescription>
              AI-generated interpretation. Not a diagnosis.
            </AlertDescription>
          </Alert>

          {/* SUMMARY */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>{analysis.summary}</CardContent>
          </Card>

          {/* DETAILED ANALYSIS */}
          {analysis.detailedAnalysis && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Detailed Clinical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.detailedAnalysis}
              </CardContent>
            </Card>
          )}

          {/* PARAMETER BREAKDOWN */}
          {analysis.findings && analysis.findings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {analysis.findings.map((finding, index) => (
                <Card
                  key={index}
                  className={cn(
                    "border-l-4",
                    finding.status === "high"
                      ? "border-l-red-500"
                      : finding.status === "low"
                      ? "border-l-blue-500"
                      : "border-l-green-500"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold">{finding.parameter}</h4>
                      <Badge
                        variant={
                          finding.status === "high"
                            ? "destructive"
                            : finding.status === "low"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {finding.status === "high" && (
                          <ArrowUp className="h-3 w-3 mr-1" />
                        )}
                        {finding.status === "low" && (
                          <ArrowDown className="h-3 w-3 mr-1" />
                        )}
                        {finding.status}
                      </Badge>
                    </div>
                    <p className="text-xl font-bold">
                      {finding.value} {finding.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ref: {finding.referenceRange}
                    </p>
                    <p className="text-sm mt-2 text-muted-foreground">
                      {finding.explanation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* RECOMMENDATIONS */}
          {analysis.recommendations && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Doctor Consultation Prep</CardTitle>
              </CardHeader>
              <CardContent>{analysis.recommendations}</CardContent>
            </Card>
          )}

          <div className="flex gap-4 print:hidden">
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={reset}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Analyze Another
            </Button>
          </div>
        </>
      )}
    </div>
  );
}