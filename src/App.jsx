import { useState, useEffect } from "react";
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function App() {
  const [text, setText] = useState("")
  const [geminiResponse, setGeminiResponse] = useState("")
  const [displayedResponse, setDisplayedResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function clicked() {
    const speechRecg = new window.webkitSpeechRecognition();
    speechRecg.continuous = false;
    speechRecg.interimResults = false;

    speechRecg.onresult = (event) => {
      let transcript = event.results[0][0].transcript
      console.log("You said:", transcript)
      setText(transcript)
    }
    speechRecg.start()
  }

  useEffect(() => {
    if (!text.trim()) return;

    async function fetchAIContent() {
      setIsLoading(true);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent({
          contents: [
            {
              parts: [
                {
                  text: `You are J.A.R.V.I.S. Give explanations in 1–2 funny lines, easy-to-understand lines. Keep it smart but hilarious. Now answer this: ${text}`
                }
              ]
            }
          ]
        });

        const response = await result.response;
        const reply = response.text() || "No response";
        setGeminiResponse(reply);
        console.log("Gemini response:", reply);
      } catch (error) {
        console.error("Error:", error);
        setGeminiResponse("Jarvis is currently unavailable due to server Issue. Please try again shortly.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAIContent();
  }, [text]);

  useEffect(() => {
    if (!geminiResponse) return;

    let index = 0;
    setDisplayedResponse("")
    const typingInterval = setInterval(() => {
      setDisplayedResponse(prev => prev + geminiResponse[index]);
      index += 1

      if (index === geminiResponse.length) {
        clearInterval(typingInterval)
      }
    }, 20)

    return () => clearInterval(typingInterval)
  }, [geminiResponse])

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="jarvis font-bold text-4xl">Jarvis A.I Assistant</div>
      <div className="mt-10 glassmorphic p-6 rounded-3xl w-full max-w-xl shadow-2xl backdrop-blur-md">
        <button
          onClick={clicked}
          className="microphone-btn flex bg-cyan-900 cursor-pointer hover:bg-cyan-700 text-white text-lg font-bold py-3 px-6 rounded-full transition duration-300"
        >
          Ask Jarvis
          <img className="mic" src="microp.png" alt="microphone" />
        </button>

        <div className="yousaid">
          <p className="text-cyan-300 font-semibold"><strong className="text-cyan-100">You said:</strong> {text}</p>
        </div>

        <div className="text-cyan-200">
          <p className="text-cyan-100 font-bold">Jarvis:</p>
          {isLoading ? (
            <div className="typing-dots text-xl font-xbold">
              <span>.</span><span>.</span><span>.</span>
            </div>
          ) : (
            <p className="text-cyan-300 font-semibold">{displayedResponse}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
