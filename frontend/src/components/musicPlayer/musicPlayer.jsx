import { useRef, useState, useEffect } from "react";
import "./musicPlayer.css";
function MusicPlayer({ audioUrl }) {
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currTime, setCurrTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [waveform, setWaveform] = useState([]);
  const progress = duration > 0 ? currTime / duration : 0;
  const bars = 25;
  const activeBar = Math.floor(waveform.length * progress);
  const toggle = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };
  const formatTime = (duration) => {
    const mins = Math.floor(duration / 60.0);
    const secs = Math.floor(duration % 60.0);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const generateWaveForm = async () => {
    const res = await fetch(audioUrl);
    const audioContext = new AudioContext();

    const bufferArray = await res.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(bufferArray);
    await audioContext.close();
    const sample = audioBuffer.getChannelData(0);

    const chunkSize = Math.floor(sample.length / bars);

    let amplitudes = [];
    for (let i = 0; i < bars; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      let val = 0;
      for (let j = start; j < end; j++) {
        val = Math.max(val, Math.abs(sample[j]));
      }
      amplitudes.push(val);
    }
    const mxAmplitude = Math.max(...amplitudes) || 1;
    const normalized = amplitudes.map((am) => am / mxAmplitude);

    setWaveform(normalized);
  };
  useEffect(() => {
    if (audioUrl) {
      generateWaveForm();
    }
  }, [audioUrl]);
  return (
    <div className="voice-message">
      <button className="play-button" onClick={toggle}>
        {" "}
        {isPlaying ? "⏸" : "▶"}{" "}
      </button>

      <audio
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration);
        }}
        onTimeUpdate={(e) => {
          setCurrTime(e.target.currentTime);
        }}
        ref={audioRef}
        src={audioUrl}
        hidden
        onPlay={() => {
          setIsPlaying(true);
        }}
        onEnded={() => {
          setCurrTime(0);
          setIsPlaying(false);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
      />

      <div
        className="waveform"
        ref={waveformRef}
        onClick={(e) => {
          const rect = waveformRef.current.getBoundingClientRect();

          const diff = e.clientX - rect.left;

          const percent = diff / rect.width;
          const seekTime = percent * duration;

          audioRef.current.currentTime = seekTime;
          setCurrTime(seekTime);
        }}
      >
        {waveform.map((amp, idx) => (
          <div
            key={idx}
            className="bar"
            style={{
              height: `${Math.max(4, amp * 40)}px`,
              background: idx < activeBar ? "yellow" : "#ebe6e6",
            }}
          />
        ))}
      </div>

      <span className="voice-duration">
        {" "}
        {`${formatTime(currTime)} / ${formatTime(duration)}`}
      </span>
      <div
        className="playback-speed"
        onClick={() => {
          const newRate = playbackRate + 0.5;
          if (newRate > 2) {
            setPlaybackRate(1);
            audioRef.current.playbackRate = 1;
          } else {
            setPlaybackRate(newRate);
            audioRef.current.playbackRate = newRate;
          }
        }}
      >
        {playbackRate}x
      </div>
    </div>
  );
}
export default MusicPlayer;
