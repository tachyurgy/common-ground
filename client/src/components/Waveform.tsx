import { useRef, useEffect } from 'react';

interface WaveformProps {
  analyserNode: AnalyserNode | null;
  isPaused: boolean;
}

export default function Waveform({ analyserNode, isPaused }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      if (isPaused) {
        // Flat line when paused
        ctx.beginPath();
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      analyserNode.getByteTimeDomainData(dataArray);

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2563eb';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw subtle bars behind the waveform
      analyserNode.getByteFrequencyData(dataArray);
      const barCount = 32;
      const barWidth = width / barCount;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] / 255;
        const barHeight = val * height * 0.6;
        const barX = i * barWidth;
        const barY = (height - barHeight) / 2;

        ctx.fillStyle = `rgba(37, 99, 235, ${0.08 + val * 0.12})`;
        ctx.fillRect(barX + 1, barY, barWidth - 2, barHeight);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyserNode, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      className="waveform-canvas"
    />
  );
}
