import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Video, VideoOff, Mic, MicOff, Camera, MonitorSpeaker, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  category: string;
  expectedAnswer: string;
  type?: 'mcq' | 'written';
  options?: string[];
}

export default function AIInterview() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [interview, setInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [selectedAudioId, setSelectedAudioId] = useState<string>("");
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStream, setTestStream] = useState<MediaStream | null>(null);
  const [diagnostics, setDiagnostics] = useState({
    deviceLabel: "",
    resolution: "",
    readyState: 0,
    fps: 0,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderMimeTypeRef = useRef<string>("");
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadInterview();
    loadDevices();
  }, [token]);

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoCams = devices.filter(d => d.kind === "videoinput" && d.deviceId && d.deviceId.trim());
      const audioMics = devices.filter(d => d.kind === "audioinput" && d.deviceId && d.deviceId.trim());
      
      console.log("Found devices:", { videoCams: videoCams.length, audioMics: audioMics.length });
      
      setVideoDevices(videoCams);
      setAudioDevices(audioMics);
      
      // Try to load saved preferences from localStorage
      const savedVideoId = localStorage.getItem("preferred_camera");
      const savedAudioId = localStorage.getItem("preferred_microphone");
      
      // Check if saved devices still exist
      const savedVideoCamExists = savedVideoId && videoCams.some(d => d.deviceId === savedVideoId);
      const savedAudioMicExists = savedAudioId && audioMics.some(d => d.deviceId === savedAudioId);
      
      // Set video device (prefer saved, fallback to first available or "default")
      if (savedVideoCamExists) {
        setSelectedVideoId(savedVideoId);
      } else if (videoCams.length > 0) {
        setSelectedVideoId(videoCams[0].deviceId);
      } else {
        setSelectedVideoId("default");
      }
      
      // Set audio device (prefer saved, fallback to first available or "default")
      if (savedAudioMicExists) {
        setSelectedAudioId(savedAudioId);
      } else if (audioMics.length > 0) {
        setSelectedAudioId(audioMics[0].deviceId);
      } else {
        setSelectedAudioId("default");
      }
    } catch (error) {
      console.error("Error loading devices:", error);
      // Set defaults so button isn't disabled
      setSelectedVideoId("default");
      setSelectedAudioId("default");
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem("preferred_camera");
    localStorage.removeItem("preferred_microphone");
    
    // Reset to first available device
    if (videoDevices.length > 0) {
      setSelectedVideoId(videoDevices[0].deviceId);
    } else {
      setSelectedVideoId("default");
    }
    
    if (audioDevices.length > 0) {
      setSelectedAudioId(audioDevices[0].deviceId);
    } else {
      setSelectedAudioId("default");
    }
    
    toast({
      title: "Reset to Defaults",
      description: "Device preferences have been cleared.",
    });
  };

  const loadInterview = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_interviews")
        .select(`
          *,
          candidates (
            full_name,
            email,
            jobs (
              position,
              job_description
            )
          )
        `)
        .eq("interview_token", token)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Interview not found",
          description: "This interview link is invalid or has expired.",
          variant: "destructive",
        });
        return;
      }

      if (data.status === "completed") {
        navigate(`/ai-interview-results/${token}`);
        return;
      }

      setInterview(data);

      // If questions already exist, use them
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions as any as Question[]);
      } else {
        // Generate questions
        await generateQuestions(data);
      }
    } catch (error: any) {
      console.error("Error loading interview:", error);
      toast({
        title: "Error",
        description: "Failed to load interview details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = async (interviewData: any) => {
    try {
      const jobData = (interviewData.candidates as any)?.jobs;
      
      // Check if job has custom interview questions
      if (jobData?.interview_questions && Array.isArray(jobData.interview_questions)) {
        console.log('Using custom interview questions from job');
        setQuestions(jobData.interview_questions);
        return;
      }
      
      // Otherwise generate questions with AI
      const { data, error } = await supabase.functions.invoke("generate-interview-questions", {
        body: {
          position: jobData?.position || "General",
          jobDescription: jobData?.job_description || "",
          numQuestions: 15,
        },
      });

      if (error) throw error;

      const generatedQuestions = data.questions;
      setQuestions(generatedQuestions);

      // Save questions to database
      await supabase
        .from("ai_interviews")
        .update({ questions: generatedQuestions })
        .eq("id", interviewData.id);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Error",
        description: "Failed to generate interview questions.",
        variant: "destructive",
      });
    }
  };

  // Attach stream to <video> safely without stopping tracks
  const attachToVideo = async (stream: MediaStream, _constraints: MediaStreamConstraints) => {
    setShowTroubleshoot(false);

    const waitForVideo = async (retries = 40): Promise<HTMLVideoElement> => {
      const v = videoRef.current;
      if (!v && retries > 0) {
        await new Promise((r) => setTimeout(r, 25));
        return waitForVideo(retries - 1);
      }
      if (!v) throw new Error("Video element not mounted");
      return v;
    };

    const vidEl = await waitForVideo();

    try {
      // Ensure tracks are enabled
      stream.getVideoTracks().forEach(t => (t.enabled = true));

      // Attach the full stream (audio + video). Some browsers keep video paused if audio is missing.
      vidEl.srcObject = stream;
      vidEl.muted = true;
      vidEl.setAttribute("playsinline", "true");

      // Capture diagnostics
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setDiagnostics({
          deviceLabel: videoTrack.label || "Unknown Device",
          resolution: `${settings.width || 0}x${settings.height || 0}`,
          readyState: videoTrack.readyState === "live" ? 1 : 0,
          fps: settings.frameRate || 0,
        });
      }

      // Try immediate play
      let played = false;
      try {
        await vidEl.play();
        played = true;
      } catch (e) {
        console.warn("video.play() immediate failed", e);
      }

      // Fallback: play on metadata/canplay/unmute
      if (!played) {
        const tryPlay = () => vidEl.play().catch((e) => console.warn("video.play() retry", e));
        vidEl.onloadedmetadata = tryPlay;
        vidEl.oncanplay = tryPlay;
        const vt = stream.getVideoTracks()[0];
        if (vt) {
          // @ts-ignore - track events exist in browsers
          vt.addEventListener?.("unmute", tryPlay, { once: true });
        }
        // Nudge once more soon after
        setTimeout(tryPlay, 400);
      }

      // Mid fallback: if no frames yet, try video-only stream briefly
      setTimeout(() => {
        if (vidEl.readyState < 2 || vidEl.videoWidth === 0) {
          const vt = stream.getVideoTracks()[0];
          if (vt) {
            const videoOnly = new MediaStream([vt]);
            vidEl.srcObject = videoOnly;
            vidEl.play().catch((e) => console.warn("video.play() video-only retry", e));
          }
        }
      }, 700);

      // Final check -> show troubleshooting if still not rendering
      setTimeout(() => {
        if (vidEl.readyState < 2 || vidEl.videoWidth === 0) {
          console.warn("Video still not rendering: readyState=", vidEl.readyState, "videoWidth=", vidEl.videoWidth);
          setShowTroubleshoot(true);
        }
      }, 1500);
    } catch (err) {
      console.error("Error attaching stream to video:", err);
      setShowTroubleshoot(true);
    }
  };

  const startTestPreview = async () => {
    try {
      setIsTesting(true);
      
      // Stop any existing test stream
      if (testStream) {
        testStream.getTracks().forEach(t => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: (selectedVideoId && selectedVideoId !== "default") 
          ? { deviceId: { exact: selectedVideoId } } 
          : true,
        audio: (selectedAudioId && selectedAudioId !== "default") 
          ? { deviceId: { exact: selectedAudioId } } 
          : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setTestStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error starting test preview:", error);
      toast({
        title: "Camera Test Failed",
        description: "Could not access camera/microphone. Check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopTestPreview = () => {
    if (testStream) {
      testStream.getTracks().forEach(t => t.stop());
      setTestStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTesting(false);
  };

  const startInterview = async () => {
    try {
      // Stop test stream if running
      stopTestPreview();
      
      // Close any previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: (selectedVideoId && selectedVideoId !== "default")
          ? { deviceId: { exact: selectedVideoId }, facingMode: "user" }
          : true,
        audio: (selectedAudioId && selectedAudioId !== "default")
          ? { deviceId: { exact: selectedAudioId }, echoCancellation: true, noiseSuppression: true }
          : { echoCancellation: true, noiseSuppression: true },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Got stream:", stream.getVideoTracks()[0]?.getSettings());

      streamRef.current = stream;

        // Move UI to interview view first so the correct <video> mounts
        setIsStarted(true);

        // Attach stream to the newly mounted video element (with fallbacks)
        await attachToVideo(stream, constraints);

      // Give camera a short warm-up before recording
      await new Promise((r) => setTimeout(r, 300));

      // Update interview status
      await supabase
        .from("ai_interviews")
        .update({
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .eq("id", interview.id);

      startRecording(stream);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast({
        title: "Camera Access Required",
        description: "Please allow camera and microphone access to continue.",
        variant: "destructive",
      });
    }
  };

  const startRecording = (stream: MediaStream) => {
    // Determine a supported mime type
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    const supported = candidates.find((t) => {
      // @ts-ignore
      return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(t);
    }) || '';

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = supported
        ? new MediaRecorder(stream, { mimeType: supported })
        : new MediaRecorder(stream);
      recorderMimeTypeRef.current = supported || '';
    } catch (err) {
      console.warn('MediaRecorder creation failed with options, retrying without:', err);
      mediaRecorder = new MediaRecorder(stream);
      recorderMimeTypeRef.current = '';
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start(1000); // Capture data every second
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    return new Promise<Blob>((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = () => {
          const type = recorderMimeTypeRef.current || 'video/webm';
          const blob = new Blob(recordedChunksRef.current, { type });
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
      } else {
        resolve(new Blob());
      }
    });
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const handleNextQuestion = () => {
    if (currentAnswer.trim()) {
      answers.push({
        question: questions[currentQuestionIndex].question,
        answer: currentAnswer,
      });
      setAnswers([...answers]);
      setCurrentAnswer("");

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        completeInterview();
      }
    } else {
      toast({
        title: "Please provide an answer",
        description: "Answer is required to continue.",
        variant: "destructive",
      });
    }
  };

  const completeInterview = async () => {
    try {
      setIsLoading(true);

      // Stop recording
      const videoBlob = await stopRecording();
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Upload video to storage
      const ext = (recorderMimeTypeRef.current && recorderMimeTypeRef.current.includes('mp4')) ? 'mp4' : 'webm';
      const fileName = `interviews/${interview.id}_${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("interview-videos")
        .upload(fileName, videoBlob);

      if (uploadError) throw uploadError;

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("interview-videos")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

      if (signedUrlError) throw signedUrlError;
      const videoUrl = signedUrlData.signedUrl;

      // Evaluate answers
      const { data: evaluationData, error: evalError } = await supabase.functions.invoke(
        "evaluate-interview-answers",
        {
          body: {
            interviewToken: token,
            questions,
            answers,
          },
        }
      );

      if (evalError) throw evalError;

      // Update interview with results
      await supabase
        .from("ai_interviews")
        .update({
          status: "completed",
          video_url: videoUrl,
          answers,
          evaluation: evaluationData.evaluation,
          score: evaluationData.evaluation.overallScore,
          completed_at: new Date().toISOString(),
        })
        .eq("id", interview.id);

      toast({
        title: "Interview Complete!",
        description: "Your responses have been recorded and evaluated.",
      });

      navigate(`/ai-interview-results/${token}`);
    } catch (error) {
      console.error("Error completing interview:", error);
      toast({
        title: "Error",
        description: "Failed to complete the interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!interview || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p className="text-lg">Interview not found or questions unavailable.</p>
        </Card>
      </div>
    );
  }

  const candidateData = interview.candidates as any;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">AI Video Interview</h1>
          <p className="text-muted-foreground">
            {candidateData?.full_name} - {candidateData?.jobs?.position}
          </p>
        </Card>

        {!isStarted ? (
          <Card className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Ready to Begin?</h2>
              <p className="text-muted-foreground">
                This interview consists of {questions.length} questions. You'll be recorded during your responses.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Device Settings</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetToDefaults}
                  className="text-xs"
                >
                  Reset to Defaults
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Camera
                </label>
                <Select 
                  value={selectedVideoId} 
                  onValueChange={(value) => {
                    setSelectedVideoId(value);
                    localStorage.setItem("preferred_camera", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Microphone
                </label>
                <Select 
                  value={selectedAudioId} 
                  onValueChange={(value) => {
                    setSelectedAudioId(value);
                    localStorage.setItem("preferred_microphone", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!isTesting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
                      <div className="text-center space-y-2">
                        <Camera className="h-12 w-12 mx-auto opacity-50" />
                        <p className="text-sm">Click Test to preview your camera</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {!isTesting ? (
                    <Button onClick={startTestPreview} variant="outline" className="w-full">
                      <Video className="h-4 w-4 mr-2" />
                      Test Camera & Microphone
                    </Button>
                  ) : (
                    <Button onClick={stopTestPreview} variant="outline" className="w-full">
                      <VideoOff className="h-4 w-4 mr-2" />
                      Stop Test
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-left max-w-md mx-auto border-t pt-4">
              <p>📹 Your video and audio will be recorded</p>
              <p>💡 Take your time to think before answering</p>
              <p>✅ Answer each question thoroughly</p>
              <p>⏱️ Estimated time: 15-20 minutes</p>
            </div>

            <Button 
              onClick={() => startInterview()} 
              size="lg" 
              className="w-full"
            >
              Start Interview
            </Button>
          </Card>
        ) : (
          <>
            {showTroubleshoot && (
              <Alert variant="destructive">
                <Camera className="h-4 w-4" />
                <AlertTitle>Camera Not Showing?</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm">Try these steps:</p>
                    <ul className="text-sm space-y-1 ml-4 list-disc">
                      <li>Click "Allow" when your browser asks for camera/microphone permission</li>
                      <li>Check if another app is using your camera</li>
                      <li>Try refreshing the page and selecting a different camera</li>
                    </ul>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          stopRecording();
                          if (streamRef.current) {
                            streamRef.current.getTracks().forEach(t => t.stop());
                          }
                          window.location.reload();
                        }}
                      >
                        Refresh & Retry
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowTroubleshoot(false)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <VideoOff className="h-12 w-12 text-white" />
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Recording
                    </div>
                  )}
                  {/* Diagnostics Tooltip */}
                  <div className="absolute top-4 left-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
                          >
                            <Info className="h-4 w-4 text-white" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                          <div className="text-xs space-y-1">
                            <div><strong>Device:</strong> {diagnostics.deviceLabel || "N/A"}</div>
                            <div><strong>Resolution:</strong> {diagnostics.resolution || "N/A"}</div>
                            <div><strong>Status:</strong> {diagnostics.readyState ? "Live" : "Not Ready"}</div>
                            <div><strong>FPS:</strong> {diagnostics.fps || "N/A"}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <Video /> : <VideoOff />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleAudio}
                  >
                    {isAudioEnabled ? <Mic /> : <MicOff />}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                      {questions[currentQuestionIndex].category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-4">
                    {questions[currentQuestionIndex].question}
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Answer:</label>
                  {questions[currentQuestionIndex].type === 'mcq' && questions[currentQuestionIndex].options ? (
                    <div className="space-y-2">
                      {questions[currentQuestionIndex].options!.map((option, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 border rounded-md cursor-pointer transition-colors",
                            currentAnswer === option
                              ? "border-primary bg-primary/10"
                              : "hover:border-primary/50"
                          )}
                          onClick={() => setCurrentAnswer(option)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                              currentAnswer === option ? "border-primary" : "border-border"
                            )}>
                              {currentAnswer === option && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="w-full h-40 p-3 border rounded-md resize-none"
                      placeholder="Type your answer here..."
                    />
                  )}
                </div>

                <Button
                  onClick={handleNextQuestion}
                  className="w-full"
                  disabled={!currentAnswer.trim()}
                >
                  {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Interview"}
                </Button>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
