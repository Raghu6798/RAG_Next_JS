"use client"

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { FileText, Link as LinkIcon, Send, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);  // State to store file

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/chat/${encodeURIComponent(query)}`);
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error occurred while fetching response.");
    }
    setLoading(false);
  };

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    // TODO: Implement URL document loading
    console.log("Loading document from URL:", url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setFile(selectedFile); // Set the uploaded file

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        // File successfully uploaded
        console.log("File uploaded:", data);
      } else {
        console.error("Failed to upload file:", data.detail);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">RAG Chat Assistant</h1>
        
        <Tabs defaultValue="chat" className="w-full border-2 border-black rounded-md"> {/* Added border */}
          <TabsList className="grid w-full grid-cols-3 border-b-2 border-black"> {/* Added border */}
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="p-6">
              <div className="flex flex-col space-y-4">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  {response && (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{response}</ReactMarkdown>
                    </div>
                  )}
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Ask a question..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading || !query.trim()}
                  >
                    {loading ? (
                      "Loading..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
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

                {/* Displaying the uploaded file */}
                {file && (
                  <div className="mt-4 text-sm text-gray-700">
                    <p>Uploaded file: <strong>{file.name}</strong></p>
                    <p>File size: <strong>{(file.size / (1024 * 1024)).toFixed(2)} MB</strong></p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="url">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter document URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <Button 
                    onClick={handleUrlSubmit}
                    disabled={!url.trim()}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Load
                  </Button>
                </div>

                {/* Displaying the entered URL */}
                {url && (
                  <div className="mt-4 text-sm text-gray-700">
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
