"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { IELogo } from "@/components/ui/ie-logo";
import { Send, Clock, Wand2, Lightbulb, UserCircle, PenTool, CheckCircle2, Lock } from "lucide-react";

export default function EssayQuizPage() {
  const [draftText, setDraftText] = useState("");
  const [finalText, setFinalText] = useState("");

  const handleCarryOver = () => {
    setFinalText(draftText);
  };

  const wordCount = finalText.trim() === "" ? 0 : finalText.trim().split(/\s+/).length;

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
            <p className="text-xs text-gray-500">Session ID: 882-941-X</p>
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 flex items-center gap-2">
              <Send className="w-4 h-4" /> Submit Exam
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback><UserCircle className="w-full h-full text-gray-400" /></AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Question Header */}
        <Card className="p-6 shadow-sm border-0">
          <p className="text-indigo-600 font-bold text-sm tracking-wider uppercase mb-2">Question 1 of 1</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Impact of AI on Modern Education</h2>
          <p className="text-gray-600 leading-relaxed max-w-4xl">
            Provide a comprehensive analysis including at least three supporting arguments regarding the 
            integration of generative AI in secondary education systems. Consider both ethical implications and 
            pedagogical advantages.
          </p>
        </Card>

        {/* Editor Area */}
        <div className="grid grid-cols-2 gap-6 h-[500px]">
          
          {/* Drafting Area */}
          <Card className="flex flex-col border-0 shadow-sm relative">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-xl">
               <div className="flex items-center gap-2 text-gray-700 font-medium">
                 <PenTool className="w-5 h-5" /> 
                 Drafting Area
               </div>
               <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded p-1">
                 {/* Toolbar mock */}
                 <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-sm font-bold w-6 h-6 flex items-center justify-center">B</button>
                 <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-sm italic w-6 h-6 flex items-center justify-center">I</button>
                 <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-sm w-6 h-6 flex items-center justify-center list-disc">•</button>
                 <div className="w-px h-4 bg-gray-300 mx-1"></div>
                 <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs w-6 h-6 flex items-center justify-center">↩</button>
                 <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs w-6 h-6 flex items-center justify-center">↪</button>
               </div>
             </div>
             <Textarea 
               className="flex-1 p-6 border-0 focus-visible:ring-0 resize-none bg-white text-gray-700 text-base"
               placeholder="Start brainstorming here... Your notes and drafts won't be graded."
               value={draftText}
               onChange={(e) => setDraftText(e.target.value)}
             />
             <div className="p-4 bg-white border-t border-gray-50 flex justify-end rounded-b-xl">
               <Button onClick={handleCarryOver} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 flex items-center gap-2">
                 Carry Over to Final &rarr;
               </Button>
             </div>
          </Card>

          {/* Final Answer */}
          <Card className="flex flex-col border-0 shadow-sm relative border-l-4 border-blue-500">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/30 rounded-t-xl">
               <div className="flex items-center gap-2 text-blue-700 font-bold">
                 <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white" /> 
                 Final Answer
               </div>
               <div className="flex items-center gap-4">
                 <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Word count: {wordCount}</span>
                 <Button variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 bg-white rounded-full flex items-center gap-2">
                   <Wand2 className="w-4 h-4" /> Paraphrase
                 </Button>
               </div>
             </div>
             <Textarea 
               className="flex-1 p-6 border-0 focus-visible:ring-0 resize-none bg-white text-gray-800 text-base leading-relaxed"
               placeholder="Type your final graded response here..."
               value={finalText}
               onChange={(e) => setFinalText(e.target.value)}
             />
             <div className="p-4 bg-white border-t border-gray-50 flex items-center justify-between rounded-b-xl text-xs text-gray-400">
               <div className="flex gap-4">
                 <span>Auto-saving...</span>
                 <span>Last saved 2m ago</span>
               </div>
               <div className="flex items-center gap-1">
                 <Lock className="w-3 h-3" /> Secure Instance
               </div>
             </div>
          </Card>
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="bg-blue-50/50 border-blue-100 p-4 flex gap-3 shadow-none">
            <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800/80 leading-relaxed">Remember to cite at least two specific technological examples to support your pedagogical claims.</p>
          </Card>
          <Card className="bg-indigo-50/50 border-indigo-100 p-4 flex gap-3 shadow-none">
            <Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-800/80 leading-relaxed">It is recommended to spend the last 15 minutes refining your final answer for clarity and grammar.</p>
          </Card>
          <Card className="bg-blue-50/50 border-blue-100 p-4 flex gap-3 shadow-none">
             <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
             <p className="text-sm text-blue-800/80 leading-relaxed">The 'Carry Over' function will append your draft to the end of your final response if it's already populated.</p>
          </Card>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 px-8 flex justify-center text-xs text-gray-400">
        <p>&copy; 2024 National Merit Board. All Rights Reserved. System Monitoring Active.</p>
      </footer>
    </div>
  );
}
