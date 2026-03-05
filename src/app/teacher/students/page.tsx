"use client";

import React, { useState } from "react";
import { Search, Plus, AlertTriangle, Info, Bell, ShieldAlert, MonitorPlay, Keyboard, FileText, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Cell, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

// Mock Data
const students = [
  { id: 1, name: "Alex Johnson", time: "2m ago", status: "high-risk", avatar: "/avatars/alex.jpg" },
  { id: 2, name: "Sarah Miller", time: "14m ago", status: "safe", avatar: "/avatars/sarah.jpg" },
  { id: 3, name: "David Chen", time: "1h ago", status: "flagged", avatar: "/avatars/david.jpg" },
];

const altTabActivityData = [
  { time: "0-2m", switches: 1 },
  { time: "2-4m", switches: 3 },
  { time: "4-6m", switches: 5 },
  { time: "6-8m", switches: 8 },
  { time: "8-10m", switches: 2 },
  { time: "10-12m", switches: 4 },
  { time: "12-14m", switches: 1 },
];

const keystrokeData = [
  { time: "0m", profile: 40, avg: 60 },
  { time: "3m", profile: 55, avg: 62 },
  { time: "6m", profile: 70, avg: 61 },
  { time: "9m", profile: 30, avg: 59 },
  { time: "12m", profile: 20, avg: 60 },
  { time: "15m", profile: 90, avg: 63 },
];

const chartConfig = {
  profile: {
    label: "Profile",
    color: "hsl(var(--chart-1))",
  },
  avg: {
    label: "Avg",
    color: "hsl(var(--chart-2))",
  },
  switches: {
    label: "Switches",
    color: "hsl(var(--chart-1))",
  }
};

export default function StudentIntegrityOverview() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(students[0]);

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <ShieldAlert size={20} />
          </div>
          <h1 className="font-semibold text-lg">IntegrityMonitor</h1>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8 bg-muted/50 border-none"
            />
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start h-auto p-1 bg-transparent">
              <TabsTrigger value="all" className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
              <TabsTrigger value="flagged" className="rounded-full px-4">Flagged</TabsTrigger>
              <TabsTrigger value="high-risk" className="rounded-full px-4">High Risk</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  selectedStudent.id === student.id ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <Avatar>
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium leading-none">{student.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Submission: {student.time}</p>
                </div>
                <div className={`h-2 w-2 rounded-full ${
                  student.status === "high-risk" ? "bg-red-500" :
                  student.status === "flagged" ? "bg-amber-500" : "bg-green-500"
                }`} />
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{selectedStudent.name}</h2>
              <p className="text-muted-foreground mt-1">
                Course: Advanced Data Structures • Quiz 4
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Content
              </Button>
              <Avatar className="h-10 w-10 border">
                <AvatarImage src="/avatars/teacher.jpg" alt="Teacher" />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Integrity Score</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">42</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <Progress value={42} className="h-2 mt-4 bg-muted [&>div]:bg-red-500" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">AI Probability</CardTitle>
                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 uppercase text-[10px] font-bold">High Risk</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Generated text patterns detected across 85% of segments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Typing Authenticity</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">15%</div>
                <div className="flex gap-1 mt-4">
                  <div className="h-1 flex-1 bg-blue-600 rounded-full"></div>
                  <div className="h-1 flex-1 bg-muted rounded-full"></div>
                  <div className="h-1 flex-1 bg-muted rounded-full"></div>
                  <div className="h-1 flex-1 bg-muted rounded-full"></div>
                  <div className="h-1 flex-1 bg-muted rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Alt-Tab Activity</CardTitle>
                <span className="text-sm font-medium text-red-500">14 switches</span>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[200px] w-full">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={altTabActivityData}>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="switches" 
                        radius={[4, 4, 0, 0]} 
                        fill="hsl(var(--chart-1))"
                      >
                        {
                          altTabActivityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.switches > 4 ? '#ef4444' : entry.switches > 2 ? '#818cf8' : '#e2e8f0'} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-2 tracking-wider">
                  <span>0M</span>
                  <span>SESSION DURATION (15M)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Keystroke Dynamics</CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-muted-foreground">Profile</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <span className="text-muted-foreground">Avg</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col justify-between">
                <div className="h-[140px] w-full">
                  <ChartContainer config={chartConfig}>
                    <LineChart data={keystrokeData}>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="avg" 
                        stroke="#cbd5e1" 
                        strokeWidth={3} 
                        strokeDasharray="5 5" 
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profile" 
                        stroke="#2563eb" 
                        strokeWidth={4} 
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
                <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded text-red-500 shadow-sm">
                     <FileText size={16} />
                  </div>
                  <span className="text-sm font-medium text-red-700">Large text paste detected at 08:24 PM (420 chars)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <CardTitle className="text-base font-semibold">Content Analysis Breakdown</CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-200"></div>
                  <span className="font-medium">Highly Likely AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></div>
                  <span className="text-muted-foreground">Human Original</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-base leading-relaxed text-slate-700 space-y-4">
                <p>
                  The implementation of a binary search tree (BST) requires careful consideration of its core properties.{" "}
                  <mark className="bg-red-100 text-slate-800 px-1 py-0.5 rounded leading-none">
                    A BST is a node-based binary tree data structure which has the following properties: The left subtree of a node contains only nodes with keys lesser than the node's key. The right subtree of a node contains only nodes with keys greater than the node's key.
                  </mark>{" "}
                  I started by defining the Node class with left and right children.
                </p>
                <p>
                  <mark className="bg-red-100 text-slate-800 px-1 py-0.5 rounded leading-none">
                    In computer science, a binary search tree, also called an ordered or sorted binary tree, is a rooted binary tree data structure with the key of each internal node being greater than all the keys in the respective node's left subtree and less than the ones in its right subtree.
                  </mark>{" "}
                  This ensures that search operations can be performed in logarithmic time complexity, provided the tree remains balanced.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
