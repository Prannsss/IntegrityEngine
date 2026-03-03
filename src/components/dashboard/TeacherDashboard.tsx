"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  User, 
  ArrowRight, 
  Search, 
  BarChart3, 
  FileText,
  ShieldAlert,
  Fingerprint as FingerprintIcon
} from 'lucide-react';
import { compareFingerprints } from '@/lib/analysis/comparison';
import { Fingerprint } from '@/lib/telemetry/types';

const MOCK_STUDENTS = [
  { 
    id: 's1', 
    name: 'Alex Rivera', 
    status: 'Flagged', 
    risk: 84,
    current: { lexical_density: 45, avg_sentence_length: 22, vocabulary_diversity: 38, burst_score: 420, flesch_kincaid_score: 14.2 },
    historical: { lexical_density: 32, avg_sentence_length: 14, vocabulary_diversity: 25, burst_score: 180, flesch_kincaid_score: 9.8 },
    flags: ['paste_event_detected', 'wpm_spike_detected']
  },
  { 
    id: 's2', 
    name: 'Jordan Smith', 
    status: 'Healthy', 
    risk: 12,
    current: { lexical_density: 28, avg_sentence_length: 13, vocabulary_diversity: 24, burst_score: 175, flesch_kincaid_score: 8.5 },
    historical: { lexical_density: 29, avg_sentence_length: 12, vocabulary_diversity: 22, burst_score: 160, flesch_kincaid_score: 8.2 },
    flags: []
  },
  { 
    id: 's3', 
    name: 'Casey Lee', 
    status: 'Healthy', 
    risk: 8,
    current: { lexical_density: 31, avg_sentence_length: 15, vocabulary_diversity: 26, burst_score: 190, flesch_kincaid_score: 9.1 },
    historical: { lexical_density: 30, avg_sentence_length: 14, vocabulary_diversity: 25, burst_score: 185, flesch_kincaid_score: 9.0 },
    flags: []
  }
];

export function TeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0]);

  const analysis = useMemo(() => {
    return compareFingerprints(selectedStudent.current, selectedStudent.historical, selectedStudent.flags);
  }, [selectedStudent]);

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-destructive';
    if (score > 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getBadgeVariant = (score: number) => {
    if (score > 70) return 'destructive';
    if (score > 30) return 'secondary';
    return 'default';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline text-primary">Academic Integrity Intelligence</h1>
          <p className="text-muted-foreground mt-1 font-body">Detecting behavioral and stylometric anomalies across student cohorts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="w-4 h-4" />
            Search Records
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground">
            Generate Report
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-headline uppercase tracking-wider text-muted-foreground px-2">Recent Submissions</h2>
          <div className="space-y-2">
            {MOCK_STUDENTS.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full text-left p-4 rounded-xl transition-all border flex flex-col gap-2 ${
                  selectedStudent.id === student.id 
                  ? 'bg-secondary/80 border-primary ring-1 ring-primary/50' 
                  : 'bg-card border-muted hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {student.name}
                  </span>
                  <Badge variant={getBadgeVariant(student.risk)} className="text-[10px] uppercase tracking-tighter">
                    {student.risk}% Risk
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground flex justify-between uppercase">
                  <span>English 101</span>
                  <span>2 hours ago</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          <Card className="bg-card border-muted overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/20 border-b border-muted">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-headline">{selectedStudent.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Comparative Fingerprint Analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-headline ${getRiskColor(analysis.riskScore)}`}>
                  {analysis.riskScore}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-headline">Integrity Risk Score</div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-sm font-headline uppercase text-muted-foreground flex items-center gap-2">
                    <FingerprintIcon className="w-4 h-4" />
                    Stylometric Deviation
                  </h3>
                  <div className="space-y-5">
                    {[
                      { label: 'Lexical Density', key: 'lexical_density' },
                      { label: 'Avg Sentence Length', key: 'avg_sentence_length' },
                      { label: 'Vocabulary Richness', key: 'vocabulary_diversity' },
                      { label: 'Flesch-Kincaid Grade', key: 'flesch_kincaid_score' },
                    ].map(metric => (
                      <div key={metric.key}>
                        <div className="flex justify-between text-sm mb-2">
                          <span>{metric.label}</span>
                          <span className={analysis.deviation[metric.key as keyof Fingerprint] > 0.4 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                            +{(analysis.deviation[metric.key as keyof Fingerprint] * 100).toFixed(0)}% Delta
                          </span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-primary/30" 
                            style={{ width: `${Math.min(100, (selectedStudent.historical[metric.key as keyof Fingerprint] / selectedStudent.current[metric.key as keyof Fingerprint]) * 100)}%` }} 
                          />
                          <div 
                            className={`h-full ${analysis.deviation[metric.key as keyof Fingerprint] > 0.4 ? 'bg-destructive' : 'bg-accent'}`} 
                            style={{ width: `${Math.min(100, (analysis.deviation[metric.key as keyof Fingerprint] * 100))}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-headline uppercase text-muted-foreground flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Detected Red Flags
                  </h3>
                  <div className="space-y-3">
                    {analysis.flags.length > 0 ? analysis.flags.map((flag, i) => (
                      <Alert key={i} variant="destructive" className="bg-destructive/10 border-destructive/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="text-xs uppercase font-headline">{flag.replace(/_/g, ' ')}</AlertTitle>
                        <AlertDescription className="text-xs opacity-80">
                          {flag === 'paste_event_detected' 
                            ? 'Instant text block insertion exceeding 100 characters detected.' 
                            : 'Burst speed exceeded 200% of historical average.'}
                        </AlertDescription>
                      </Alert>
                    )) : (
                      <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>No Behavioral Flags</AlertTitle>
                        <AlertDescription className="text-xs">Typing dynamics are consistent with historical baseline.</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 border border-muted mt-8">
                    <h4 className="text-xs font-headline uppercase mb-3 text-primary flex items-center gap-2">
                      <BarChart3 className="w-3 h-3" />
                      Interpretation Summary
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.explanation} 
                      The student showed a significant { (analysis.deviation.burst_score * 100).toFixed(0) }% increase in typing burst variability, 
                      often associated with machine-assisted content drafting.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-muted p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Submission Content
              </h3>
              <Badge variant="outline">Revision v2</Badge>
            </div>
            <div className="prose prose-invert max-w-none text-muted-foreground leading-loose h-48 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-muted">
              <p>The implications of generative models in late capitalism represent a paradoxical shift in the valuation of intellectual labor. As we observe the flattening of creative output through automated synthesis, the role of the individual author becomes decentralized, if not entirely vestigial...</p>
              <p>In this context, we must ask if the stylistic nuances we previously attributed to human genius are merely patterns of token distribution that can be replicated through sufficient stochastic refinement. The current submission explores these boundaries through a lens of digital archaeology.</p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}