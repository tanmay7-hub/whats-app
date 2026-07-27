export function AudioRecorder({ showRecorder, onAudioRecorded }) {
  if (!showRecorder) return null;

  const [isRecording, setIsRecording] = useState(false);
  const [liveWaveform, setLiveWaveform] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);

  const audioRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null);

  const startAudioRecording = async () => {
    setLiveWaveform([]);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    audioContextRef.current = audioContext;
    source.connect(analyser);
    audioRecorderRef.current = recorder;
    chunksRef.current = [];

    const updateWaveform = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      analyser.getByteTimeDomainData(dataArray);

      let mx = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const distance = Math.abs(dataArray[i] - 128);

        mx = Math.max(mx, distance);
      }

      const amplitude = mx / 128;

      setLiveWaveform((prev) => {
        const next = [...prev, amplitude];
        if (next.length > 70) {
          next.shift();
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(updateWaveform);
    };

    recorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    updateWaveform();
    recorder.start();
    setIsRecording(true);
  };
  const stopAudioRecording = async () => {
    const recorder = audioRecorderRef.current;

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      onAudioRecorded(audioBlob);
    };
    streamRef.current?.getTracks().forEach((track) => track.stop());
    cancelAnimationFrame(animationRef.current);
    audioContextRef.current?.close();

    recorder.stop();
    setIsRecording(false);
  };
  const formattedTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return formattedTime;
  };
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animationRef.current);

      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
    };
  }, []);
  return (
    <>
      {isRecording && (
        <div className="recording-ui">
          <div className="recording-indicator">🎤 Recording...</div>

          <div className="live-waveform">
            {liveWaveform.map((amp, idx) => (
              <div
                key={idx}
                className="wave-bar"
                style={{ height: `${Math.max(7, amp * 70)}px` }}
              />
            ))}
          </div>

          <div>{formattedTime(recordingTime)}</div>
        </div>
      )}

      <div
        className="audio-div"
        onClick={() => {
          if (isRecording) {
            stopAudioRecording();
            clearInterval(timerRef.current);
            timerRef.current = null;
          } else {
            startAudioRecording();
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
              setRecordingTime((prev) => prev + 1);
            }, 1000);
          }
        }}
      >
        {isRecording ? (
          <i className="fa-solid fa-stop"></i>
        ) : (
          <i className="fa-solid fa-microphone"></i>
        )}
      </div>
    </>
  );
}
