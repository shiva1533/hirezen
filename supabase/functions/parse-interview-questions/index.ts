import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import * as zip from "https://deno.land/x/zipjs@v2.7.34/index.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new Error("No file uploaded");
    }

    console.log("Parsing interview questions from file:", file.name, "Type:", file.type, "Size:", file.size);

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File too large. Maximum size is 10MB");
    }

    if (file.size === 0) {
      throw new Error("Uploaded file is empty");
    }

    let questionsText = "";
    
    // Check file type
    const isZipFile = file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip';
    const isTextFile = file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md') || file.type === 'text/plain';
    const isPdfFile = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    
    if (isPdfFile) {
      // Handle PDF file - call parse-pdf function
      console.log("Processing PDF file");
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const fileData = `data:application/pdf;base64,${base64Data}`;
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase configuration missing");
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke("parse-pdf", {
        body: { fileData, fileName: file.name },
      });
      
      if (pdfError) throw new Error(`PDF parsing failed: ${pdfError.message}`);
      if (!pdfData?.text) throw new Error("No text extracted from PDF");
      
      questionsText = pdfData.text;
      console.log("Extracted text from PDF");
    } else if (isTextFile) {
      // Handle single text file
      console.log("Processing single text file");
      questionsText = await file.text();
    } else if (isZipFile) {
      // Handle ZIP file
      console.log("Processing ZIP file");
      const arrayBuffer = await file.arrayBuffer();
      
      // Validate it's actually a ZIP file by checking magic bytes
      const uint8Array = new Uint8Array(arrayBuffer);
      const isPKZip = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B;
      
      if (!isPKZip) {
        throw new Error("File is not a valid ZIP archive. Please upload a valid ZIP file or text file (.txt, .md)");
      }
      
      const blob = new Blob([arrayBuffer]);
      
      try {
        const zipReader = new zip.ZipReader(new zip.BlobReader(blob));
        const entries = await zipReader.getEntries();
        
        console.log(`Found ${entries.length} entries in ZIP`);
        
        // Find and read text files in the zip
        for (const entry of entries) {
          if (entry.filename.endsWith('.txt') || entry.filename.endsWith('.md')) {
            console.log(`Reading ${entry.filename}`);
            if (entry.getData) {
              const textWriter = new zip.TextWriter();
              const text = await entry.getData(textWriter);
              questionsText += text + "\n\n";
            }
          }
        }
        
        await zipReader.close();
      } catch (zipError: any) {
        console.error("ZIP parsing error:", zipError);
        throw new Error(`Failed to read ZIP file: ${zipError.message}. Please ensure the file is a valid ZIP archive`);
      }
    } else {
      throw new Error("Unsupported file format. Please upload a PDF, ZIP file containing .txt or .md files, or a single .txt or .md file");
    }
    
    if (!questionsText || questionsText.trim().length === 0) {
      throw new Error("No text content found. Please ensure your file contains interview questions");
    }

    console.log(`Extracted ${questionsText.length} characters of text`);

    // Parse questions using AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Parse the following interview questions and answers from the uploaded file content.

File Content:
${questionsText}

Extract and format the questions in the following JSON structure:
- First 10 questions should be MCQ (multiple choice) with 4 options each
- Remaining questions should be written/descriptive questions
- Identify the correct answer for MCQ questions
- Extract expected answers for written questions

Return ONLY a JSON array in this exact format:
[
  {
    "question": "MCQ question text?",
    "category": "technical" or "behavioral",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "expectedAnswer": "The correct option"
  },
  {
    "question": "Written question text?",
    "category": "technical" or "behavioral",
    "type": "written",
    "expectedAnswer": "Expected answer guideline"
  }
]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert at parsing and structuring interview questions. Always respond with valid JSON arrays only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let questions;
    try {
      const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();
      questions = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI did not return valid questions array");
    }

    console.log("Parsed questions:", questions.length);

    return new Response(
      JSON.stringify({ questions }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in parse-interview-questions function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
