"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { FileText, Link as LinkIcon, Send, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { IoPersonOutline } from "react-icons/io5";
import { GiSpermWhale } from "react-icons/gi";
import { FaFilePdf } from "react-icons/fa";


export default function Home() {
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<{ query: string; response: string }[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat automatically when a new message is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/chat/${encodeURIComponent(query)}`);
      const data = await res.json();
      
      setMessages((prev) => [...prev, { query, response: data.response }]);
      setQuery("");
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setFile(selectedFile);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        console.log("File uploaded:", data);
      } else {
        console.error("Failed to upload file:", data.detail);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8"> <FaFilePdf/> RAG Chat Assistant</h1>

        <Tabs defaultValue="chat" className="w-full border-2 border-gray-700 rounded-md">
          <TabsList className="grid w-full grid-cols-3 border-b-2 border-gray-700">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="p-6 bg-gray-900 text-white">
              <div className="flex flex-col space-y-4">
                <ScrollArea ref={scrollRef} className="h-[400px] w-full rounded-md border border-gray-700 p-4 overflow-y-auto">
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div key={index} className="mb-4">
  {/* User Message */}
  <p className="text-sm font-semibold text-blue-400">
    <IoPersonOutline size={20} /> {/* Adjust size as needed */}
  </p>
  <p className="mb-2">{msg.query}</p>

  {/* DeepSeek Response */}
  <p className="text-sm font-semibold text-blue-400 flex items-center">
    <GiSpermWhale size={30} className="mr-1" /> {/* Increased size */}
    DeepSeek :
  </p>
  <ReactMarkdown className="text-gray-300">{msg.response}</ReactMarkdown>
</div>

                    ))
                  ) : (
                    <p className="text-gray-500">Start a conversation...</p>
                  )}
                </ScrollArea>

                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Ask a question..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-gray-800 text-white"
                  />
                  <Button onClick={handleSubmit} disabled={loading || !query.trim()} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? "Loading..." : <><Send className="w-4 h-4 mr-2" /> Send</>}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="p-6 bg-gray-900 text-white">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, TXT, DOCX (MAX. 10MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.txt,.docx"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {file && (
                  <div className="mt-4 text-sm text-gray-400">
                    <p>Uploaded file: <strong>{file.name}</strong></p>
                    <p>File size: <strong>{(file.size / (1024 * 1024)).toFixed(2)} MB</strong></p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url">
            <Card className="p-6 bg-gray-900 text-white">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter document URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-gray-800 text-white"
                  />
                  <Button className="bg-green-600 hover:bg-green-700" disabled={!url.trim()}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Load
                  </Button>
                </div>

                {url && (
                  <div className="mt-4 text-sm text-gray-400">
                    <p>Entered URL: <strong>{url}</strong></p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
