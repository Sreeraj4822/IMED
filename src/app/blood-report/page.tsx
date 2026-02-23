
"use client";

import { useState, useRef, useEffect } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle2, Info, RefreshCcw, ArrowUp, ArrowDown, Activity, FileType, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeBloodReport, BloodReportOutput } from '@/ai/flows/blood-report-analysis';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function BloodReportPage() {
  const { toast } = useToast();
  const [reportText, setReportText] = useState('');
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BloodReportOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Libraries for file extraction (loaded dynamically to avoid SSR issues)
  const pdfjsRef = useRef<any>(null);
  const mammothRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import heavy libraries only on the client
    const loadLibs = async () => {
      try {
        const [pdfjs, mammoth] = await Promise.all([
          import('pdfjs-dist'),
          import('mammoth')
        ]);
        
        // Configure PDF.js worker
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        
        pdfjsRef.current = pdfjs;
        mammothRef.current = mammoth;
      } catch (err) {
        console.error('Failed to load document processing libraries:', err);
      }
    };
    loadLibs();
  }, []);

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    if (!pdfjsRef.current) throw new Error('PDF library not loaded');
    
    const pdf = await pdfjsRef.current.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(' ') + '\n';
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReportPhoto(reader.result as string);
          setReportText(''); // Clear text if an image is used primarily
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(arrayBuffer);
        setReportText(text);
        setReportPhoto(null);
        setIsLoading(false);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        if (!mammothRef.current) throw new Error('Word processing library not loaded');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammothRef.current.extractRawText({ arrayBuffer });
        setReportText(result.value);
        setReportPhoto(null);
        setIsLoading(false);
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported File",
          description: "Please upload an image (JPG/PNG), PDF, or Word (.docx) document.",
        });
        setFileName(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to read the file. It might be corrupted or unsupported.",
      });
      setFileName(null);
      setIsLoading(false);
    }
  };

  const handleAnalysis = async () => {
    if (!reportText.trim() && !reportPhoto) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please upload a report or paste your results.",
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
        description: "We couldn't process your report. Please ensure the data is clear.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setReportText('');
    setReportPhoto(null);
    setFileName(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline tracking-tight">Blood Report Analyzer</h1>
            <p className="text-muted-foreground font-medium">Get instant AI insights from your lab results.</p>
          </div>
        </div>
      </div>

      {/* Report Header for Print */}
      <div className="hidden print:block mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">IMED Search AI - Blood Analysis Report</h1>
        <p className="text-sm text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {!analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden">
          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle>Option 1: Upload File</CardTitle>
              <CardDescription>
                Upload an image, PDF, or Word document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-[300px]",
                  (reportPhoto || fileName) ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                {reportPhoto ? (
                  <div className="relative w-full h-full">
                    <img src={reportPhoto} alt="Report Preview" className="w-full h-full object-contain rounded-lg shadow-sm" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg text-white font-bold">
                      Change File
                    </div>
                  </div>
                ) : fileName ? (
                  <div className="flex flex-col items-center text-center">
                    <FileType className="h-16 w-16 text-primary mb-4" />
                    <p className="font-bold text-lg text-primary truncate max-w-[200px]">{fileName}</p>
                    <p className="text-sm text-muted-foreground mt-2">Document ready</p>
                    <Button variant="ghost" className="mt-4" onClick={(e) => { e.stopPropagation(); reset(); }}>Remove</Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-primary/5 p-4 rounded-full mb-4">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <p className="font-bold text-lg text-primary">Click to upload report</p>
                    <p className="text-sm text-muted-foreground mt-2 text-center">Supports JPG, PNG, PDF, DOCX</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*,.pdf,.docx" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-secondary shadow-lg">
            <CardHeader>
              <CardTitle>Option 2: Paste Text</CardTitle>
              <CardDescription>
                Paste text from your digital report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste results here..."
                className="min-h-[300px] text-base p-4 resize-none"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 flex justify-center pt-4">
            <Button 
              size="lg" 
              className="px-12 h-14 text-lg font-bold rounded-full shadow-xl hover:scale-105 transition-transform" 
              onClick={handleAnalysis} 
              disabled={isLoading || (!reportText.trim() && !reportPhoto)}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5 animate-spin" /> Processing...
                </span>
              ) : "Start AI Interpretation"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 shadow-sm print:hidden">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Medical Disclaimer</AlertTitle>
            <AlertDescription className="text-xs">
              This interpretation is generated by AI for educational purposes. It is not a clinical diagnosis. 
              Always share this analysis and your original report with your doctor.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-md overflow-hidden print:shadow-none print:border-none">
                <CardHeader className="bg-primary/5 border-b print:bg-transparent print:px-0">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Executive Brief</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 print:px-0">
                  <p className="text-lg text-foreground leading-relaxed font-medium mb-6">
                    {analysis.summary}
                  </p>
                  <div className="p-5 bg-accent/30 rounded-xl border border-accent print:bg-transparent print:border-none print:p-0">
                    <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-3">Clinical Significance</h3>
                    <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                      {analysis.detailedAnalysis.split('\n').map((p, i) => (
                        <p key={i} className="mb-4">{p}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-l-4 border-l-secondary print:shadow-none print:border-none">
                <CardHeader className="print:px-0">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    Doctor Consultation Prep
                  </CardTitle>
                </CardHeader>
                <CardContent className="print:px-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {analysis.recommendations}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary print:mt-12">
                <Activity className="h-5 w-5" />
                Parameter Breakdown
              </h3>
              <div className="space-y-4">
                {analysis.findings.map((finding, idx) => (
                  <Card key={idx} className={cn(
                    "transition-all border-l-4 overflow-hidden print:break-inside-avoid print:shadow-none",
                    finding.status === 'high' ? "border-l-destructive bg-destructive/5" :
                    finding.status === 'low' ? "border-l-primary bg-primary/5" :
                    "border-l-secondary bg-secondary/5"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-primary">{finding.parameter}</h4>
                        <Badge variant={
                          finding.status === 'high' ? 'destructive' : 
                          finding.status === 'low' ? 'default' : 
                          'secondary'
                        } className="capitalize flex items-center gap-1">
                          {finding.status === 'high' && <ArrowUp className="h-3 w-3" />}
                          {finding.status === 'low' && <ArrowDown className="h-3 w-3" />}
                          {finding.status}
                        </Badge>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-black text-foreground">{finding.value}</span>
                        <span className="text-sm text-muted-foreground">{finding.unit}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">
                        Ref Range: {finding.referenceRange}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {finding.explanation}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-3 print:hidden">
                <Button className="w-full h-12 rounded-xl flex items-center gap-2 shadow-lg" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </Button>
                <Button variant="outline" className="w-full h-12 rounded-xl flex items-center gap-2" onClick={reset}>
                  <RefreshCcw className="h-4 w-4" />
                  Analyze Another Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
