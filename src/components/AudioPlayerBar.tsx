import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Clock,
  FastForward,
} from 'lucide-react';
import { Meeting } from '../types';

interface AudioPlayerBarProps {
  meeting: Meeting;
  currentSecond: number;
  onSeek: (seconds: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  meeting,
  currentSecond,
  onSeek,
  isPlaying,
  onTogglePlay,
  playbackRate,
  onChangePlaybackRate,
}) => {
  const totalSeconds = (meeting.durationMinutes || 30) * 60;
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);

  // Sync real audio element if audioUrl exists
  useEffect(() => {
    if (audioElementRef.current && meeting.audioUrl) {
      if (isPlaying) {
        audioElementRef.current.play().catch(() => {});
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [isPlaying, meeting.audioUrl]);

  useEffect(() => {
    if (audioElementRef.current && meeting.audioUrl) {
      audioElementRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, meeting.audioUrl]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
    if (audioElementRef.current && meeting.audioUrl) {
      audioElementRef.current.currentTime = val;
    }
  };

  const handleSkip = (delta: number) => {
    const next = Math.max(0, Math.min(totalSeconds, currentSecond + delta));
    onSeek(next);
    if (audioElementRef.current && meeting.audioUrl) {
      audioElementRef.current.currentTime = next;
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    onChangePlaybackRate(nextSpeed);
  };

  const progressPercent = Math.min(100, (currentSecond / totalSeconds) * 100);

  return (
    <div
      id="meeting-audio-player-bar"
      className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-md transition-theme flex flex-col gap-2.5"
    >
      {meeting.audioUrl && (
        <audio
          ref={audioElementRef}
          src={meeting.audioUrl}
          onTimeUpdate={() => {
            if (audioElementRef.current) {
              onSeek(audioElementRef.current.currentTime);
            }
          }}
          onEnded={() => {
            if (isPlaying) onTogglePlay();
          }}
        />
      )}

      {/* Top Row: Info + Equalizer Animation */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isPlaying
                ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div className="truncate">
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {meeting.fileName || `${meeting.title}.mp3`}
            </p>
            <p className="text-[10px] text-slate-400">
              {meeting.audioUrl ? 'Direct Audio Stream' : 'AI Speech Synchronizer'} • {meeting.durationMinutes} mins
            </p>
          </div>
        </div>

        {/* Dynamic Wave Equalizer Bars */}
        <div className="flex items-end gap-0.5 h-4 px-2">
          {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying
                  ? 'bg-indigo-500 dark:bg-indigo-400'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1) * 0.35) % 100)}%` : '20%',
              }}
            />
          ))}
        </div>
      </div>

      {/* Center Row: Scrub Bar */}
      <div className="space-y-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={totalSeconds}
            step={0.5}
            value={currentSecond}
            onChange={handleSliderChange}
            aria-label="Meeting audio progress slider"
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono font-medium text-slate-400">
          <span>{formatTime(currentSecond)}</span>
          <span>{formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* Bottom Row: Controls */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Skip -10s */}
          <button
            onClick={() => handleSkip(-10)}
            title="Rewind 10 seconds"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause CTA */}
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Sync</span>
              </>
            )}
          </button>

          {/* Skip +10s */}
          <button
            onClick={() => handleSkip(10)}
            title="Forward 10 seconds"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed & Mute */}
        <div className="flex items-center gap-2">
          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold transition-all cursor-pointer"
          >
            {playbackRate}x
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
