import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [code, setCode] = useState("");
  const [reviewResult, setReviewResult] = useState("");
  const [translatedCode, setTranslatedCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // List of programming languages for the dropdown
  const programmingLanguages = [
    "Python",
    "JavaScript",
    "Java",
    "C#",
    "C++",
    "Go",
    "Ruby",
    "PHP",
    "TypeScript",
    "Swift",
    "Kotlin",
    "Rust",
    "Dart",
    "Scala",
    "R",
  ];

  // Function to show popup every 15 seconds
  useEffect(() => {
    const popupInterval = setInterval(() => {
      setShowPopup(true);
      
      // Hide popup after 5 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    }, 15000);

    // Show popup immediately on first load
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(popupInterval);
  }, []);

  // Function to redirect to chat
  const redirectToChat = () => {
    window.location.href = 'http://localhost:8501/';
  };

  // Function to get code review
  const getCodeReview = async () => {
    if (!code.trim()) {
      setError("Please enter some code to review");
      return;
    }

    setIsLoading(true);
    setError("");
    setReviewResult("");
    setTranslatedCode("");
    setSelectedLanguage("");

    try {
      const response = await axios.post("http://localhost:8080/ai/get-review", {
        code: code,
      });

      if (response.data && response.data.response) {
        // Clean up the response by removing markdown formatting characters
        const cleanedResponse = response.data.response
          .replace(/#{1,6}\s?/g, '') // Remove headings (# symbols)
          .replace(/\*\*/g, '')       // Remove bold formatting
          .replace(/\*/g, '')         // Remove italic formatting
          .replace(/`{1,3}/g, '')     // Remove code blocks and inline code
          .replace(/>\s?/g, '')       // Remove blockquotes
          .replace(/\n\s*[-+*]\s/g, '\n• ') // Standardize bullet points
          .replace(/\n\s*\d+\.\s/g, '\n• '); // Convert numbered lists to bullet points

        setReviewResult(cleanedResponse);
      } else {
        setError("Received an invalid response from the server");
      }
    } catch (err) {
      console.error("Error getting code review:", err);
      setError(
        err.response?.data?.message ||
          "Failed to get code review. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Translate code
  const translateCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to translate");
      return;
    }

    if (!selectedLanguage) {
      setError("Please select a target language");
      return;
    }

    setIsTranslating(true);
    setError("");
    setTranslatedCode("");

    try {
      const response = await axios.post("http://localhost:8080/ai/get-review", {
        code: code,
        translateTo: [selectedLanguage],
      });

      console.log("Full response from server:", response.data); // Debugging: Log the full response

      if (response.data && response.data.response) {
        const fullResponse = response.data.response;

        // Look for the translated code section
        const translationMarker = `🔄 Code translated to ${selectedLanguage}:`;
        const translationIndex = fullResponse.indexOf(translationMarker);

        if (translationIndex !== -1) {
          // Extract the translated code section
          let translatedSection = fullResponse.substring(translationIndex);

          // Look for code block with triple backticks
          const codeBlockRegex = /```[\w-]*\n([\s\S]*?)```/;
          const match = translatedSection.match(codeBlockRegex);

          if (match && match[1]) {
            // Extract the code content from inside the code block
            setTranslatedCode(match[1].trim());
          } else {
            // Fallback method if regex doesn't match
            const codeBlockStart = translatedSection.indexOf("```");
            if (codeBlockStart !== -1) {
              const potentialLangMarker = translatedSection.substring(
                codeBlockStart + 3,
                translatedSection.indexOf("\n", codeBlockStart)
              );
              const actualStart =
                codeBlockStart + 3 + potentialLangMarker.length + 1;
              const codeBlockEnd = translatedSection.indexOf(
                "```",
                actualStart
              );

              if (codeBlockEnd !== -1) {
                const extractedCode = translatedSection
                  .substring(actualStart, codeBlockEnd)
                  .trim();
                setTranslatedCode(extractedCode);
              } else {
                setError(
                  "Could not locate the end of the code block in the translation"
                );
              }
            } else {
              setError("Could not find the code block in the translation");
            }
          }
        } else {
          setError(
            `Translation to ${selectedLanguage} not found in the response. Try again or choose a different language.`
          );
        }
      } else {
        setError("Received an invalid response from the server");
      }
    } catch (err) {
      console.error("Error translating code:", err);
      setError(
        err.response?.data?.message ||
          "Failed to translate code. Please try again."
      );
    } finally {
      setIsTranslating(false);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  // Function to format the review text for better display
  const formatReviewText = (text) => {
    if (!text) return "";
    
    // Split the text by lines
    const lines = text.split('\n');
    const formattedLines = lines.map((line, index) => {
      // Style section headers (assuming they're typically shorter lines that don't start with bullet points)
      if (line.trim().length > 0 && line.trim().length < 50 && !line.trim().startsWith('•')) {
        return <div key={index} className="text-lg font-semibold text-blue-700 mt-3 mb-2">{line}</div>;
      }
      // Style bullet points
      else if (line.trim().startsWith('•')) {
        return <div key={index} className="ml-4 my-1 flex"><span className="text-blue-500 mr-2">•</span>{line.substring(1)}</div>;
      }
      // Regular text
      else {
        return <div key={index} className="my-1">{line}</div>;
      }
    });

    return <div className="text-gray-800">{formattedLines}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-6xl font-bold text-center mb-8 text-blue-600">
        CodeGGlance
        </h1>

        {/* Code Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Enter Your Code</h2>
          <div className="mb-4">
            <textarea
              className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here for review and translation..."
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              className={`flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              onClick={getCodeReview}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>Get Code Review</>
              )}
            </button>

            <div className="flex flex-1 gap-2">
              <select
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isTranslating}
              >
                <option value="">Select a language to translate to...</option>
                {programmingLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>

              <button
                className={`flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition ${
                  isTranslating || !selectedLanguage
                    ? "opacity-75 cursor-not-allowed"
                    : ""
                }`}
                onClick={translateCode}
                disabled={isTranslating || !selectedLanguage}
              >
                {isTranslating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Translating...
                  </>
                ) : (
                  <>Translate Code</>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Review Result Section */}
        {reviewResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Code Review Results</h2>
              <button
                className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                onClick={() => copyToClipboard(reviewResult)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto max-h-[600px]">
              {formatReviewText(reviewResult)}
            </div>
          </div>
        )}

        {/* Translated Code Section */}
        {translatedCode && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Translated Code ({selectedLanguage})
              </h2>
              <button
                className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                onClick={() => copyToClipboard(translatedCode)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[400px]">
              {translatedCode}
            </div>
          </div>
        )}

        {/* Chat Bot Icon */}
        <div 
          className="fixed bottom-6 right-6 cursor-pointer z-50"
          onClick={redirectToChat}
        >
          {/* Bot Icon */}
          <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          
          {/* Popup Notification */}
          {showPopup && (
            <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-4 w-64 text-gray-800 border border-gray-200 animate-bounce">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Need help with your code?</p>
                  <p className="text-xs mt-1">Click to chat with our AI assistant!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;