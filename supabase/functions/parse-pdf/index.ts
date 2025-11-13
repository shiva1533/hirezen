import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName } = await req.json();

    if (!fileData) {
      return new Response(JSON.stringify({ error: "No file data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Parsing PDF: ${fileName ?? "unnamed"}`);

    // Convert base64 to Uint8Array
    const base64Data = (fileData as string).includes(",")
      ? (fileData as string).split(",")[1]
      : (fileData as string);
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Simple PDF text extraction using regex patterns
    // This works for basic PDFs by parsing the content stream directly
    const pdfText = new TextDecoder().decode(bytes);
    
    // Extract text from PDF content streams
    // Look for text between BT (Begin Text) and ET (End Text) operators
    const textBlocks: string[] = [];
    const btMatches = pdfText.matchAll(/BT\s+([\s\S]*?)\s+ET/g);
    
    for (const match of btMatches) {
      const block = match[1];
      // Extract text from Tj and TJ operators
      const tjMatches = block.matchAll(/\(((?:[^()\\]|\\[()])*)\)\s*Tj/g);
      const tjArrayMatches = block.matchAll(/\[((?:[^\[\]\\]|\\[\[\]])*)\]\s*TJ/g);
      
      for (const tjMatch of tjMatches) {
        textBlocks.push(tjMatch[1]);
      }
      
      for (const tjArrayMatch of tjArrayMatches) {
        const arrayContent = tjArrayMatch[1];
        const textParts = arrayContent.matchAll(/\(((?:[^()\\]|\\[()])*)\)/g);
        for (const part of textParts) {
          textBlocks.push(part[1]);
        }
      }
    }

    // Clean and join the extracted text
    let allText = textBlocks
      .map(text => {
        // Decode PDF string escapes
        return text
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\b/g, '\b')
          .replace(/\\f/g, '\f')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\')
          .replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`Extracted ${allText.length} characters from PDF`);

    // Estimate page count from PDF structure
    const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
    const pageCount = pageMatches ? pageMatches.length : 1;

    // Check if PDF has enough text content
    const isImageOnly = allText.length < 100;

    if (isImageOnly) {
      console.log(`Low text detected (${allText.length} chars) - attempting OCR...`);
      
      // Try OCR on the PDF
      const OCR_API_KEY = Deno.env.get('OCR_SPACE_API_KEY');
      
      if (!OCR_API_KEY) {
        return new Response(
          JSON.stringify({
            error: "This appears to be a scanned PDF with minimal text. OCR is not configured.",
            text: allText,
            pages: pageCount,
            info: { fileName },
            isImageOnly: true
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        // Prepare form data for OCR.space API
        const formData = new FormData();
        formData.append('base64Image', fileData);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy

        const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': OCR_API_KEY,
          },
          body: formData,
        });

        const ocrResult = await ocrResponse.json();
        
        if (ocrResult.IsErroredOnProcessing) {
          throw new Error(ocrResult.ErrorMessage?.[0] || 'OCR processing failed');
        }

        const ocrText = ocrResult.ParsedResults?.[0]?.ParsedText || '';
        console.log(`OCR extracted ${ocrText.length} characters`);

        if (ocrText.length < 50) {
          return new Response(
            JSON.stringify({
              error: "OCR completed but extracted minimal text. The PDF may be too low quality or contain no readable text.",
              text: ocrText,
              pages: pageCount,
              info: { fileName },
              isImageOnly: true
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            text: ocrText,
            pages: pageCount,
            info: { fileName },
            isImageOnly: false,
            usedOCR: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

      } catch (ocrError) {
        console.error('OCR error:', ocrError);
        return new Response(
          JSON.stringify({
            error: "Failed to perform OCR on scanned PDF",
            details: ocrError instanceof Error ? ocrError.message : String(ocrError),
            text: allText,
            pages: pageCount,
            info: { fileName },
            isImageOnly: true
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        text: allText,
        pages: pageCount,
        info: { fileName },
        isImageOnly: false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("PDF parsing error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to parse PDF",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
