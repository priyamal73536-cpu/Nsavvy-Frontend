import React, { useState, useEffect, useRef } from 'react';
// --- GEMINI AI ENGINE IMPORTS ---
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
function App() {
  const [isListening, setIsListening] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConversationMode, setIsConversationMode] = useState(false);
  // AI Name State Logic
  const [aiName, setAiName] = useState(localStorage.getItem('aiName') || '');
  const [isNameSet, setIsNameSet] = useState(!!localStorage.getItem('aiName'));
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'NSavvy AI Voice Core ready hai! Kuch puchiye Piyush bhai, main bol kar jawab dunga. 😎', time: '9:10 PM' },
  ]);

  // --- 🚀 AUTO-MIC SUBMISSION ENGINE ---
  useEffect(() => {
    // Agar mic abhi-abhi band hua hai (listening false hua), 
    // Hum Conversation Mode mein hain, aur user ne kuch bola hai (transcript khali nahi hai)
    if (!isListening && isConversationMode && transcript && transcript.trim().length > 0) {
      
      console.log("🎤 Auto-Mic ne suna:", transcript);
      
      // Sawaal seedha AI ko bhej do bina Wake-Word check kiye!
      triggerAIResponse(transcript); 
      
      // VIP Pass wapas le lo agle round tak
      setIsConversationMode(false); 
      resetTranscript();
    }
  }, [isListening, isConversationMode, transcript]);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // 📄 DETAILED SCREEN STATES (UX Mastermind Features)
  const [isDetailScreenOpen, setIsDetailScreenOpen] = useState(false);
  const [detailedText, setDetailedText] = useState("");

 // --- 🚀 BULLETPROOF ₹0 AUDIO ENGINE (VIA BACKEND) ---
  const speakText = async (textToSpeak, autoMic = false) => {
    try {
      console.log("🗣️ Requesting Premium Audio from Backend...");
      
      // Apne backend se aawaz mango (Agar Render par push kar diya ho toh localhost ki jagah render ka link daal dena)
      const response = await fetch('https://nsavvy-api.onrender.com/api/tts', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak })
      });

      const data = await response.json();
      
      if (data.audioContent) {
        // Backend ne jo aawaz bheji, usko play karo!
        const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
        audio.play();

       // 🎙️ THE CONTINUOUS VOICE LOOP INJECTION 🎙️
        audio.onended = () => {
          if (autoMic) {
            console.log("🗣️ AI chup ho gaya. Conversation Mode ON!");
            setIsConversationMode(true); // VIP Pass de diya!
            resetTranscript(); // Purana text clear kar do
            startListening(); // Mic ON kar do
          }
        };
      }
    } catch (error) {
      console.error("Audio fetch me error aaya:", error);
    }
  };
  // --- END OF AUDIO ENGINE ---

  
// 📄 CHAT SYSTEM FUNCTIONS (UI Update)
  const handleNewMessage = (sender, text) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        sender: sender,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

 // 🔄 THE STUBBORN MULTI-RETRY ENGINE + MEMORY WIRE + PREMIUM BUTTON FIX
  const triggerAIResponse = async (userMsgText, retryCount = 0) => {
    try {
      console.log(`Sending request to backend (Attempt: ${retryCount + 1})...`);
      
      // 🧠 MEMORY WIRE: Backend ko naye text ke sath purani poori chat bhej rahe hain
      const response = await fetch('https://nsavvy-api.onrender.com/api/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsgText,
          history: messages // 👈 YEH RAHI TERI CHAT HISTORY!
        })
      });

      const data = await response.json();

      if (data.reply) {
        console.log("Backend se Split-Brain Jawaab Aaya!", data);

        const cleanReply = data.reply.replace(/[*#_`~]/g, '');
        const cleanSummary = data.summary ? data.summary.replace(/[*#_`~]/g, '') : "Sir, maine jawaab dhoondh liya hai.";

        setDetailedText(cleanReply);

        // 🎯 THE BUTTON FIX: Isme id aur time add kar diya taaki React UI button dikha sake
        setMessages((prev) => [
          ...prev, 
          { 
            id: Date.now(), 
            sender: 'ai', 
            text: cleanSummary, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hasDetails: true 
          }
        ]);

        speakText(cleanSummary, true);
      } else {
        throw new Error("Empty response from server");
      }

    } catch (error) {
      console.error(`🛑 Request Fail Hui (Attempt ${retryCount + 1}):`, error);

      if (retryCount < 3) {
        const nextDelay = (retryCount + 1) * 2000; 
        console.log(`⚠️ API load par hai. Automatically retrying in ${nextDelay / 1000} seconds...`);
        
        setTimeout(() => {
          triggerAIResponse(userMsgText, retryCount + 1);
        }, nextDelay);
        
      } else {
        const premiumErrorMsg = "Aapka sawaal sach mein bohot impressive aur genuine hai sir! Kripya ek baar dobara puchein.";
        
        setMessages((prev) => [
          ...prev, 
          { 
            id: Date.now(), 
            sender: 'ai', 
            text: premiumErrorMsg, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hasDetails: false 
          }
        ]);
        speakText(premiumErrorMsg); 
      }
    }
  };

  // --- 🎙️ VOICE CAPTURE ENGINE ---
// --- 🎙️ PURE VOICE ENGINE (NO WAVES, NO MIC LOCK) ---
// --- USP 1: THE FINAL PRODUCTION WAKE-WORD ENGINE (HINGLISH SAFE) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser voice support nahi karta!");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false; 
    rec.interimResults = false;
    
    // 🛑 THE MASTER FIX: 'hi-IN' ki jagah 'en-IN' kar diya hai
    // Isse Google Hinglish samjhega aur 'love' ko English script mein hi likhega!
    rec.lang = 'en-IN'; 

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.toLowerCase().trim();
      const wakeWord = aiName.toLowerCase().trim();

      console.log(`Suna: "${spokenText}" | Chahiye tha: "${wakeWord}"`);

      // WAKE-WORD CHECK
      if (wakeWord !== '' && spokenText.includes(wakeWord)) {
        const command = spokenText.replace(wakeWord, '').trim();

        if (command.length > 2) {
          triggerAIResponse(command); // Sawaal Dimaag tak gaya!
        } else {
          speakText("Haan boss, main ready hoon, bataiye?"); // Sirf naam pukara
        }
      } else {
        console.log("Ignored: Wake word match nahi hua.");
      }
    };

    rec.onerror = (event) => {
      console.error("Mic Error:", event.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    try {
      rec.start();
    } catch (e) {
      console.error("Mic start nahi ho paya!");
    }
  };
  // --- END OF ENGINE ---
 
// --- NAYA UI: PROFESSIONAL GRAND WELCOME SCREEN ---
  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
        {/* Premium Dark Glassmorphism Card */}
        <div className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-800">
          
          <div className="text-center mb-8">
            {/* TERA NAYA LOGO YAHAN HAI */}
            <img src="/nsavvy-logo.png" alt="NSavvy Logo" className="h-16 mx-auto mb-4 object-contain" />
            <p className="text-gray-400 text-sm tracking-wide">₹0 Budget Scalable Assistant</p>
          </div>

          {/* Dummy Auth Section (Backend Phase ke liye) */}
          <div className="space-y-4 mb-8">
            <input 
              type="email" 
              placeholder="Enter your Email ID" 
              className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            <button className="w-full bg-gray-800 text-gray-500 font-semibold p-4 rounded-xl border border-gray-700 cursor-not-allowed">
              Verify via OTP (Coming in Phase 2)
            </button>
          </div>

          <hr className="border-gray-800 mb-8" />

          {/* Functional AI Name Section (Custom Wake-Word) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Apne AI Assistant ka pyara sa naam rakhein <span className="text-blue-500">*</span>
            </label>
            <input
              type="text"
              value={aiName}
              onChange={(e) => setAiName(e.target.value)}
              placeholder="e.g., Jarvis, Friday, Buddy"
              className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-purple-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">Yeh naam bheed mein aapke AI ko active karega.</p>
          </div>

          {/* Legal Compliance Checkboxes */}
          <div className="space-y-3 mb-8 text-sm text-gray-400">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500" />
              <span>I agree to the <span className="text-blue-400 hover:underline">Terms & Conditions</span></span>
            </label>
          </div>

          {/* The Magic Entry Button */}
          <button
            onClick={() => {
              if(aiName.trim() !== '') {
                localStorage.setItem('aiName', aiName); // Dimaag mein naam save
                setIsNameSet(true); // Welcome screen hata kar main app dikhao
              } else {
                alert('Bhai, bina naam ke AI kaisa? Ek mast sa naam daal de!');
              }
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold p-4 rounded-xl shadow-lg transform transition-all active:scale-95"
          >
            Enter NSavvy Universe 🚀
          </button>
        </div>
      </div>
    );
  }
  // --- END OF WELCOME SCREEN ---
console.log("Current Messages State:", messages);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 text-white font-sans overflow-hidden select-none">
      
      {errorMsg && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 border border-red-400 text-white p-3 rounded-xl shadow-xl z-50 text-xs text-center font-bold">
          ⚠️ DEBUG LOG: {errorMsg}
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col relative z-10">
        
        {/* PROFESSIONAL LOGO HEADER BLOCK */}
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          {/* TERA CHHOTA SYMBOL YAHAN HAI */}
          <img src="/nsavvy-symbol.png" alt="NSavvy Mark" className="h-10 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-white">NSAVVY AI</h1>
            <p className="text-xs text-emerald-400 font-medium tracking-wide">• Standing By | {aiName}</p>
          </div>
        </div>
        
        {/* Tera purana Close/Clear button yahan rakh lena agar chahiye */}
      </div>

        {/* PRIMARY MAIN CONSOLE */}
        <div className="flex flex-col items-center my-4">
          <div className="w-full bg-slate-950/40 border border-white/5 rounded-2xl p-3 mb-8 text-center">
            <p className={`text-xs font-medium tracking-wide transition-colors duration-300 ${isListening ? 'text-rose-400 font-bold animate-pulse' : 'text-indigo-400'}`}>
              {isListening ? `🎙️ Speak Now... (Volume: ${Math.round(micVolume)})` : "⚡ Standing By | Say Wake-Word"}
            </p>
          </div>

          {/* SONIC WAVES */}
          <div className="relative my-8 flex items-center justify-center">
            {isListening && (
              <>
                <div style={{ transform: `scale(${1 + micVolume / 60})`, opacity: 0.1 + micVolume / 150 }} className="absolute w-32 h-32 bg-rose-500 rounded-full blur-md transition-transform duration-75 pointer-events-none"></div>
                <div style={{ transform: `scale(${1 + micVolume / 40})` }} className="absolute w-36 h-36 border border-rose-400/40 rounded-full animate-pulse pointer-events-none"></div>
              </>
            )}

            <button 
              onClick={startListening}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border transition-all duration-500 shadow-xl relative z-10
                ${isListening ? 'bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 border-rose-300/60 scale-105 shadow-rose-500/30' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
            >
              <span className="text-[10px] font-bold tracking-wider">
                {isListening ? "LISTENING" : "TAP TO TALK"}
              </span>
            </button>
          </div>
        </div>

        {/* --- ⌨️ TEXT FALLBACK FOR TESTING --- */}
        <div className="mt-8 flex gap-2 justify-center w-full max-w-md px-4">
          <input
            type="text"
            id="textInput"
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-full text-black outline-none border-2 border-indigo-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim() !== '') {
                handleNewMessage('user', e.target.value);
                triggerAIResponse(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById('textInput');
              if (input.value.trim() !== '') {
                handleNewMessage('user', input.value);
                triggerAIResponse(input.value);
                input.value = '';
              }
            }}
            className="bg-indigo-600 px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all"
          >
            SEND
          </button>
        </div>

       {/* CHAT LOGS */}
          {messages.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="h-44 overflow-y-auto mb-4 pr-1 space-y-3 text-xs">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} mb-3`}>
                    
                    {/* Chat Bubble */}
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl leading-relaxed ${
                      msg.sender === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none' : 'bg-gray-800 text-white rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>

                    {/* 🚀 THE BULLETPROOF BUTTON LOGIC */}
                    {msg.sender === 'ai' && msg.hasDetails === true && (
                      <button
                        onClick={() => setIsDetailScreenOpen(true)}
                        className="mt-3 mb-1 flex w-max items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/30 rounded-xl text-teal-300 text-sm font-semibold hover:bg-teal-500/30 transition-all shadow-[0_0_15px_rgba(20,184,166,0.1)] hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] z-10"
                      >
                        ✨ Read Detailed Answer
                      </button>
                    )}

                    {/* Time Stamp */}
                    <span className="text-[10px] text-slate-500 mt-0.5 px-1">{msg.time || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

      </div>
   {/* 💎 THE REAL PREMIUM GLASSMORPHIC DETAILED READER 💎 */}
      {isDetailScreenOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl transition-all duration-500">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-gradient-to-b from-gray-900/90 to-black/90 border border-teal-500/30 rounded-3xl shadow-[0_0_80px_rgba(20,184,166,0.15)] overflow-hidden">
            
            {/* Header (Sleek Glass & Glow) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <h3 className="text-teal-300 font-bold text-xl tracking-wide flex items-center gap-2">
                <span>✨</span> Detailed Insights
              </h3>
              <button 
                onClick={() => {
                  window.speechSynthesis.cancel(); // Close karte hi chup
                  setIsDetailScreenOpen(false);
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-red-500/40 rounded-full transition-all border border-white/5 hover:border-red-400/50"
              >
                ✕ Close
              </button>
            </div>

            {/* Body (Fixed Text Formatting: whitespace-pre-wrap lagaya hai) */}
            <div className="p-7 overflow-y-auto text-gray-100 text-[15px] leading-loose font-light custom-scrollbar whitespace-pre-wrap pb-24">
               {detailedText}
            </div>

            {/* 🎙️ IN-BUILT FLOATING MIC (For Doubts) 🎙️ */}
            <button
              onClick={() => {
                window.speechSynthesis.cancel(); // Pehle AI ko chup karao
                startListening(); // Phir naya sawaal suno
              }}
              className={`absolute bottom-24 right-6 w-14 h-14 flex items-center justify-center rounded-full shadow-2xl z-50 transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.8)] scale-110' 
                  : 'bg-gradient-to-tr from-indigo-500 to-purple-600 hover:scale-110 shadow-[0_0_20px_rgba(99,102,241,0.6)] border border-white/20'
              }`}
            >
              <span className="text-2xl">{isListening ? '🛑' : '🎙️'}</span>
            </button>

            {/* Footer (Action Bar: Copy, Play, Stop - Ekdum Separated) */}
            <div className="p-5 border-t border-white/10 bg-black/60 flex justify-between items-center backdrop-blur-md">
               
               {/* Left: Copy Button */}
               <button
                 onClick={() => {
                   navigator.clipboard.writeText(detailedText);
                   alert("Text Copied Sir! 📋");
                 }}
                 className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-teal-300 font-medium rounded-xl border border-white/10 hover:border-teal-500/50 transition-all"
               >
                 📋 Copy Text
               </button>

               {/* Right: Audio Controls (Separated) */}
               <div className="flex gap-3">
                 <button
                   onClick={() => {
                     window.speechSynthesis.cancel(); // Pehle purana audio clear karo
                     const utterance = new SpeechSynthesisUtterance(detailedText);
                     window.speechSynthesis.speak(utterance); // Naya play karo
                   }}
                   className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transition-all transform hover:-translate-y-0.5"
                 >
                   ▶️ Play
                 </button>
                 
                 <button
                   onClick={() => {
                     window.speechSynthesis.cancel(); // Turant Stop
                   }}
                   className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500/80 to-rose-600/80 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.2)] hover:shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all border border-red-500/30 transform hover:-translate-y-0.5"
                 >
                   ⏹️ Stop
                 </button>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
} 


export default App;