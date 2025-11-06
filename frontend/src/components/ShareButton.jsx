import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const shareUrl = window.location.href;

  const handleShare = async () => {
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Basketball Team Schedule',
          text: 'Check out our basketball team schedule!',
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy to clipboard
      setShowShare(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShare(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-accent-primary to-accent-lightred hover:from-accent-lightred hover:to-accent-primary text-white rounded-xl transition-all font-black uppercase text-sm tracking-wider shadow-xl shadow-accent-primary/30"
      >
        <Share2 className="w-5 h-5" />
        Share Schedule
      </button>

      {showShare && (
        <div className="absolute top-full mt-2 right-0 bg-dark-surface rounded-xl p-4 border border-dark-border shadow-2xl min-w-[300px] z-20">
          <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Share Link</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-lightred text-white rounded-lg transition-all font-bold"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          {copied && (
            <div className="text-xs text-green-400 mt-2 font-bold">✓ Copied to clipboard!</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ShareButton;
