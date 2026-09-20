import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileAudio,
  FileVideo,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  File,
  Mic,
  MicOff,
  Square,
  Play,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sampleUploadTranscripts } from '../data/mockData';
import { MagneticButton } from '../components/MagneticButton';

export const UploadMeetingPage: React.FC = () => {
  const { setPage, setProcessingMeetingData, addToast } = useApp();

  // Mode: 'upload' | 'record' | 'paste'
  const [activeMode, setActiveMode] = useState<'upload' | 'record' | 'paste'>('upload');

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string } | null>(
    null
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [meetingTitle, setMeetingTitle] = useState('Product Roadmap & Action Alignment');
  const [meetingDate, setMeetingDate] = useState('2026-09-24');
  const [participants, setParticipants] = useState('Rahul Sharma, Priya Patel, Arjun Mehta, Sarah Jenkins');
  const [transcriptText, setTranscriptText] = useState('');
  const [focusOption, setFocusOption] = useState<'standard' | 'actions' | 'decisions'>('standard');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Live Microphone Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [micVolume, setMicVolume] = useState<number[]>(new Array(16).fill(10));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Clean up audio & recording streams on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((t) => t.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [audioStream]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: globalThis.File) => {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFile({
      name: file.name,
      size: `${sizeMb} MB`,
      type: file.type || file.name.split('.').pop() || 'file',
    });

    // Auto title if clean
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (baseName.length > 3) {
      setMeetingTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }

    // If audio/video, create object URL for in-app player
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }

    // If text / markdown / srt / vtt / json, read file text
    if (
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.vtt') ||
      file.name.endsWith('.srt') ||
      file.name.endsWith('.json')
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setTranscriptText(text);
          addToast('Transcript Loaded', `Extracted text from ${file.name}`, 'info');
        }
      };
      reader.readAsText(file);
    } else {
      addToast('File Attached', `${file.name} ready for AI analysis.`, 'info');
    }
  };

  const handleSelectSample = (sample: typeof sampleUploadTranscripts[0]) => {
    setSelectedFile({
      name: sample.fileName,
      size: '2.4 MB',
      type: 'transcript',
    });
    setMeetingTitle(sample.title);
    setParticipants(sample.participants);
    setTranscriptText(sample.transcript);
    setAudioUrl(null);
    addToast('Demo File Loaded', `Loaded sample: ${sample.title}`, 'info');
  };

  // Live Recording Handlers
  const startLiveRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start Web Audio API visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateBars = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars = [];
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * 2] || 0;
          bars.push(Math.max(15, (val / 255) * 100));
        }
        setMicVolume(bars);
        animationFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();

      // Timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Web Speech recognition if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let fullStr = '';
          for (let i = 0; i < event.results.length; i++) {
            fullStr += event.results[i][0].transcript + ' ';
          }
          if (fullStr) {
            setTranscriptText((prev) => {
              if (prev && !prev.includes(fullStr.trim())) {
                return prev + '\nSpeaker: ' + fullStr.trim();
              }
              return 'Speaker: ' + fullStr.trim();
            });
          }
        };

        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      }

      addToast('Recording Started', 'Speak clearly into your microphone.', 'info');
    } catch (err) {
      console.error(err);
      addToast('Microphone Access Error', 'Please allow microphone access in your browser.', 'error');
    }
  };

  const stopLiveRecording = () => {
    setIsRecording(false);
    if (audioStream) {
      audioStream.getTracks().forEach((t) => t.stop());
      setAudioStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const calculatedSize = Math.max(0.2, recordingSeconds * 0.05).toFixed(1);
    setSelectedFile({
      name: `live_recording_${recordingSeconds}s.wav`,
      size: `${calculatedSize} MB`,
      type: 'audio/wav',
    });
    addToast('Recording Captured', `${recordingSeconds}s recorded. Ready for analysis.`, 'success');
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleStartAnalysis = () => {
    if (!meetingTitle.trim()) {
      addToast('Missing Title', 'Please provide a meeting title.', 'warning');
      return;
    }

    // Set uploading progress state
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Forward to AI Processing Page with all collected dynamic data
            setProcessingMeetingData({
              title: meetingTitle,
              date: new Date(meetingDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              isoDate: meetingDate,
              fileName: selectedFile?.name || 'meeting_recording.mp3',
              fileType: selectedFile?.type?.includes('mp4') ? 'video' : 'audio',
              audioUrl: audioUrl || undefined,
              rawTranscript: transcriptText,
              participantsStr: participants,
              customPrompt: focusOption,
            });
            setPage('processing');
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Upload Meeting
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload audio, record live, or paste your transcript for real-time AI action extraction.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center p-1.5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-theme">
        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('record')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'record'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Live Recording</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('paste')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'paste'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste / Edit Notes</span>
        </button>
      </div>

      {/* 1. UPLOAD FILE MODE */}
      {activeMode === 'upload' && (
        <div
          id="upload-dropzone"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative p-8 sm:p-10 rounded-3xl border-2 border-dashed text-center transition-all duration-200 cursor-pointer ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-[#0f1422]/60 hover:border-slate-400 dark:hover:border-slate-700'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.mp4,.webm,.m4a,.txt,.pdf,.docx,.json,.vtt,.srt,.md"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {selectedFile ? selectedFile.name : 'Drop your recording or transcript here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedFile
                  ? `${selectedFile.size} · Click to choose different file`
                  : 'Drag and drop MP3, WAV, MP4, TXT, MD, or click to browse'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">MP3 / WAV</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">MP4</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">TXT / MD</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">VTT / SRT</span>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Browse Files
            </button>
          </div>
        </div>
      )}

      {/* 2. LIVE RECORDING MODE */}
      {activeMode === 'record' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 text-center space-y-6 shadow-sm transition-theme">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              <Mic className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {isRecording ? 'Listening & Transcribing...' : 'Browser Microphone Recording'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isRecording
                ? 'Speak normally. Your audio is analyzed with live speech tokens.'
                : 'Click "Start Recording" to capture real-time team discussion directly.'}
            </p>
          </div>

          {/* Waveform visualizer */}
          <div className="flex items-center justify-center gap-1.5 h-14 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            {micVolume.map((vol, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  isRecording ? 'bg-rose-500 dark:bg-rose-400' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                style={{ height: `${vol}%` }}
              />
            ))}
          </div>

          {/* Time & Record CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="font-mono text-xl font-bold text-slate-800 dark:text-slate-100">
              {formatSecs(recordingSeconds)}
            </div>

            {!isRecording ? (
              <button
                type="button"
                onClick={startLiveRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopLiveRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop & Save Recording</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. PASTE / EDIT TRANSCRIPT MODE */}
      {activeMode === 'paste' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 space-y-3 shadow-sm transition-theme">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Meeting Notes / Dialogue Transcript
            </label>
            <span className="text-[11px] text-slate-400">
              Supports `Speaker: Text` or plain bullet points
            </span>
          </div>

          <textarea
            rows={8}
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder="e.g.&#10;10:00 Elena: We conducted customer interviews on the new dashboard.&#10;10:04 Alex: Decision: We will prioritize Linear integration for November.&#10;10:08 Maya: I will finish the webhook handler by October 4th."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-mono text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>
      )}

      {/* Sample Demo Selectors */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Try a real pre-configured sample meeting:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {sampleUploadTranscripts.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Use "{sample.title.split(' ')[0]}..."
            </button>
          ))}
        </div>
      </div>

      {/* Metadata Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-sm transition-theme">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">
          Meeting Metadata & Focus
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g. Product Strategy Meeting"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Date
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Participants (comma separated)
          </label>
          <input
            type="text"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="Rahul Sharma, Priya Patel, Arjun Mehta..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* AI Focus Pill Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Extraction Focus
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard', label: 'Balanced Synthesis', desc: 'All decisions, actions & questions' },
              { id: 'actions', label: 'Action Centric', desc: 'Prioritize tasks & deadlines' },
              { id: 'decisions', label: 'Executive Directives', desc: 'Focus on consensus & strategy' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFocusOption(opt.id as any)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  focusOption === opt.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="font-semibold text-xs">{opt.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Progress Bar if active */}
        {isUploading && (
          <div className="pt-2 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Extracting meeting tokens & semantic structures...</span>
              <span className="font-semibold text-indigo-500">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Analyze Meeting CTA */}
        <div className="pt-4">
          <MagneticButton
            id="analyze-meeting-submit-btn"
            type="button"
            disabled={isUploading}
            onClick={handleStartAnalysis}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isUploading ? 'Synthesizing Meeting Intelligence...' : 'Analyze Meeting'}</span>
            {!isUploading && <ArrowRight className="w-4 h-4 ml-1" />}
          </MagneticButton>
        </div>
      </div>
    </div>
  );
};
