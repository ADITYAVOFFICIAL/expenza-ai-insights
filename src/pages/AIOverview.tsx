// src/pages/AIOverview.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Sparkles, AlertTriangle, ThumbsUp, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { generateComprehensiveAnalysis, fetchFinancialProfileData } from '@/lib/geminiAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface AnalysisResult {
  overallHealthScore: number;
  scoreJustification: string;
  keyObservations: string[];
  actionableSteps: { title: string; description: string; priority: string }[];
  positiveReinforcement: string;
  riskAssessment: string;
}

const AIOverview = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    // --- THIS IS THE CORRECTED LINE ---
    if (!user?.$id) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Step 1: Fetch all data using the centralized function
      const financialData = await fetchFinancialProfileData(user.$id);

      // Step 2: Check if there's enough data to proceed
      if (financialData.allExpenses.length < 5) {
        setError("Not enough data for a meaningful analysis. Please add at least 5 transactions.");
        setIsLoading(false);
        return;
      }

      // Step 3: Send the aggregated data to Gemini for analysis
      const analysisResult = await generateComprehensiveAnalysis(financialData);
      setAnalysis(analysisResult);

    } catch (err: any) {
      console.error("AI Analysis failed:", err);
      setError(err.message || "An unexpected error occurred while generating the report.");
      toast({
        title: "Analysis Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center min-h-[50vh]">
          <Sparkles className="w-16 h-16 text-primary animate-pulse mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Sam is analyzing your finances...</h2>
          <p className="text-muted-foreground">This may take a moment. We're crafting your personalized report.</p>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Analysis Failed</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={runAnalysis}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!analysis) {
      return <p className="text-center text-muted-foreground">No analysis available.</p>;
    }

    const scoreColor = analysis.overallHealthScore > 75 ? 'text-green-500' : analysis.overallHealthScore > 50 ? 'text-yellow-500' : 'text-red-500';

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Your Financial Health Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className={`text-7xl font-bold ${scoreColor}`}>{analysis.overallHealthScore}<span className="text-3xl text-muted-foreground">/100</span></div>
            <Progress value={analysis.overallHealthScore} className="w-full max-w-sm h-3" />
            <p className="text-muted-foreground text-center max-w-md">{analysis.scoreJustification}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ThumbsUp className="text-green-500" /> What You're Doing Well</CardTitle></CardHeader>
            <CardContent><p>{analysis.positiveReinforcement}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-red-500" /> Potential Risks</CardTitle></CardHeader>
            <CardContent><p>{analysis.riskAssessment}</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Key Observations</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.keyObservations.map((obs, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your Action Plan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {analysis.actionableSteps.map((step, index) => (
              <div key={index} className="p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-foreground">{step.title}</h4>
                  <Badge variant={step.priority === 'High' ? 'destructive' : 'secondary'}>{step.priority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex items-center gap-3">
        <Bot className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">AI Financial Overview</h1>
          <p className="text-muted-foreground">A personalized report on your financial health, powered by Gemini.</p>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default AIOverview;