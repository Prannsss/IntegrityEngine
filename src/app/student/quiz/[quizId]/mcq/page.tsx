"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { IELogo } from "@/components/ui/ie-logo";
import { Progress } from "@/components/ui/progress";
import { Send, UserCircle, Flag, ChevronLeft, ChevronRight, Info, CheckCircle2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Mock Data
const totalQuestions = 25;
const mockQuestions = [
  {
    id: 1,
    status: 'answered'
  },
  {
    id: 2,
    status: 'answered'
  },
  {
    id: 3,
    status: 'answered'
  },
  {
    id: 4,
    status: 'current'
  },
  {
    id: 5,
    status: 'pending'
  },
  {
    id: 16,
    status: 'flagged'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'answered': return 'bg-emerald-500 text-white border-emerald-500';
    case 'current': return 'bg-blue-600 text-white border-blue-600';
    case 'flagged': return 'bg-white text-gray-700 border-orange-400 relative';
    default: return 'bg-white text-gray-500 border-gray-200';
  }
};

export default function MCQQuizPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>("B");

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
             <IELogo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-lg">National Merit Examination</h1>
            <p className="text-xs text-gray-500">Session ID: 88291</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
             <div className="flex items-center space-x-2 text-2xl font-bold text-indigo-600">
               <span>01</span>
               <span className="text-gray-400 mb-1">:</span>
               <span>42</span>
               <span className="text-gray-400 mb-1">:</span>
               <span>15</span>
             </div>
             <div className="flex space-x-6 text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
               <span>HRS</span>
               <span>MIN</span>
               <span>SEC</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 flex items-center gap-2 font-medium shadow-md shadow-blue-500/20">
              Submit Exam
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback><UserCircle className="w-full h-full text-gray-400" /></AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      {/* Progress Bar Area */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Current Progress</span>
          <span className="text-sm font-bold text-blue-600">4 / 25 Questions</span>
        </div>
        <Progress value={16} className="h-2 bg-gray-200" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex gap-8">
        
        {/* Left Column / Questions */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="p-8 shadow-sm border-0 rounded-2xl flex-1 flex flex-col bg-white">
            <div className="flex items-center gap-3 text-blue-600 font-bold text-xs tracking-widest uppercase mb-6">
              <span className="bg-blue-100 p-1 rounded-sm"><CheckCircle2 className="w-4 h-4" /></span>
              Section A: Cybersecurity Fundamentals
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-snug">
              Question 4 of 25: Which of the following best describes the principle of 'Least Privilege' in cybersecurity?
            </h2>

            <RadioGroup defaultValue="B" onValueChange={setSelectedOption} className="space-y-4">
              
              <div className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer hover:bg-gray-50
                ${selectedOption === "A" ? "border-blue-600 bg-blue-50/50" : "border-gray-100"}`}
                onClick={() => setSelectedOption("A")}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${selectedOption === "A" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>A</div>
                <span className={`text-base font-medium flex-1 ${selectedOption === "A" ? "text-blue-900" : "text-gray-700"}`}>
                  Granting users administrative access only during business hours.
                </span>
              </div>

              <div className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer hover:bg-gray-50
                ${selectedOption === "B" ? "border-blue-600 bg-blue-50/50" : "border-gray-100"}`}
                onClick={() => setSelectedOption("B")}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${selectedOption === "B" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>B</div>
                <span className={`text-base font-medium flex-1 ${selectedOption === "B" ? "text-blue-900" : "text-gray-700"}`}>
                  Ensuring users are granted only the minimum level of access necessary to perform their jobs.
                </span>
                {selectedOption === "B" && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
              </div>

              <div className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer hover:bg-gray-50
                ${selectedOption === "C" ? "border-blue-600 bg-blue-50/50" : "border-gray-100"}`}
                onClick={() => setSelectedOption("C")}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${selectedOption === "C" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>C</div>
                <span className={`text-base font-medium flex-1 ${selectedOption === "C" ? "text-blue-900" : "text-gray-700"}`}>
                  Using multiple passwords for a single user account to increase security.
                </span>
              </div>

              <div className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer hover:bg-gray-50
                ${selectedOption === "D" ? "border-blue-600 bg-blue-50/50" : "border-gray-100"}`}
                onClick={() => setSelectedOption("D")}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${selectedOption === "D" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>D</div>
                <span className={`text-base font-medium flex-1 ${selectedOption === "D" ? "text-blue-900" : "text-gray-700"}`}>
                  Providing all employees with the same level of access to simplify management.
                </span>
              </div>
            </RadioGroup>

            {/* Navigation Actions */}
            <div className="mt-auto pt-8 flex items-center justify-between">
              <Button variant="outline" className="rounded-full px-6 py-6 text-gray-600 border-gray-200 hover:bg-gray-50 font-bold flex gap-2 w-auto">
                <ChevronLeft className="w-5 h-5" /> Previous
              </Button>
              <Button variant="outline" className="rounded-full px-8 py-6 text-orange-500 border-orange-200 hover:bg-orange-50 font-bold flex gap-2">
                <Flag className="w-5 h-5" /> Flag for Review
              </Button>
              <Button className="rounded-full px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold flex gap-2 shadow-md shadow-blue-500/20">
                Next Question <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column / Sidebar */}
        <div className="w-80 flex flex-col gap-6">
          <Card className="p-6 shadow-sm border-0 rounded-2xl bg-white">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
              <span className="grid grid-cols-2 gap-1">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm"></div>
              </span>
              Question Navigator
            </h3>
            
            <div className="grid grid-cols-5 gap-3 mb-8">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const num = i + 1;
                // mock status
                let status = 'pending';
                if (num < 4) status = 'answered';
                if (num === 4) status = 'current';
                if (num === 16) status = 'flagged';
                
                return (
                  <div key={num} className="relative w-10 h-10 flex items-center justify-center">
                    <button 
                      className={`h-10 w-10 text-sm font-semibold rounded-full border flex items-center justify-center transition-all ${getStatusColor(status)}`}
                    >
                      {num}
                    </button>
                    {status === 'flagged' && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <Flag className="w-3 h-3 text-orange-500 fill-orange-500" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Answered
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div> Current
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <div className="w-3 h-3 rounded-full bg-gray-200"></div> Pending
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <div className="w-3 h-3 rounded-full border-2 border-orange-400"></div> Flagged
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl shadow-none">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-indigo-500" />
              Instructions
            </h3>
            <p className="text-sm text-indigo-800/80 leading-relaxed">
              Ensure you review your flagged questions before final submission. The exam will auto-submit when the timer reaches zero.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-12 flex justify-between text-xs text-gray-400 border-t border-gray-200 mt-auto bg-white">
        <p>&copy; 2024 National Merit Examination Board. Secure Environment Active.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-600">Privacy Policy</a>
          <a href="#" className="hover:text-gray-600">Exam Guidelines</a>
          <a href="#" className="hover:text-gray-600">Technical Support</a>
        </div>
      </footer>
    </div>
  );
}
