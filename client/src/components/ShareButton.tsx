import { useState } from 'react';

interface ShareButtonProps {
  agreementId: number;
}

export default function ShareButton({ agreementId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}agreement/${agreementId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button className={`btn btn-ghost share-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
      {copied ? 'Link Copied' : 'Share'}
    </button>
  );
}
