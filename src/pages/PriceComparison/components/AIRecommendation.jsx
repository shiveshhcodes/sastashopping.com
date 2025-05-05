import React, { useState } from 'react';
import { Sparkle, Loader2 } from 'lucide-react';
import './AIRecommendation.css';

const colorMap = {
  buy: {
    bg: 'rgba(56, 203, 137, 0.13)',
    border: '#38cb89',
    icon: '#38cb89',
    text: '#1e251f',
    message: 'Based on current data, this is a favorable time to purchase. (Buy now!)',
  },
  wait: {
    bg: 'rgba(255, 193, 7, 0.13)',
    border: '#ffc107',
    icon: '#ffc107',
    text: '#7a5d00',
    message: 'Wait for some more time, price may drop soon.',
  },
  avoid: {
    bg: 'rgba(255, 87, 87, 0.13)',
    border: '#ff5757',
    icon: '#ff5757',
    text: '#7a1f1f',
    message: 'Currently, you should not buy as the price is very high.',
  },
};

const aiTypes = ['buy', 'wait', 'avoid'];

function getRandomAIType() {
  return aiTypes[Math.floor(Math.random() * aiTypes.length)];
}

function AnimatedEllipsis() {
  // Simple animated ...
  const [dotCount, setDotCount] = useState(1);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((c) => (c % 3) + 1);
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return <span>{'.'.repeat(dotCount)}</span>;
}

function AIRecommendation() {
  const [showRec, setShowRec] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [aiType, setAIType] = useState('buy');

  const handleClick = () => {
    setProcessing(true);
    setShowRec(false);
    setTimeout(() => {
      const type = getRandomAIType();
      setAIType(type);
      setProcessing(false);
      setShowRec(true);
    }, 2800);
  };

  if (processing) {
    return (
      <div className="ai-recommendation-modern d-flex align-items-center gap-3 p-4 mb-0" style={{ background: '#f8faf8', border: '1.5px solid #e0e0e0', color: '#888', fontFamily: 'inherit', minHeight: 70 }}>
        <Loader2 className="ai-spin" size={28} style={{ color: '#6c5ce7' }} />
        <div style={{ fontWeight: 500, fontSize: '1.08rem' }}>
          Analyzing real-time price trends and retailer data with <span style={{ color: '#6c5ce7', fontWeight: 700 }}>SastaShopping AI</span>
          <AnimatedEllipsis />
        </div>
      </div>
    );
  }

  if (!showRec) {
    return (
      <button className="ai-recommendation-btn" onClick={handleClick}>
        <Sparkle size={22} style={{ marginRight: 8, color: '#6c5ce7', transition: 'color 0.18s' }} /> Wanna take AI recommendation?
      </button>
    );
  }

  const color = colorMap[aiType];
  return (
    <div
      className="ai-recommendation-modern d-flex align-items-center gap-3 p-4 mb-0 ai-animate-in"
      style={{
        background: color.bg,
        border: `1.5px solid ${color.border}`,
        color: color.text,
        fontFamily: 'inherit',
        minHeight: 70,
        boxShadow: '0 0 16px 0 ' + color.bg,
        transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
      }}
    >
      <div className="ai-icon-pulse" style={{ color: color.icon, borderColor: color.border, width: 40, height: 40 }}>
        <Sparkle size={26} />
      </div>
      <div>
        <div className="fw-normal fs-6 mb-1" style={{ color: color.text, fontWeight: 500, fontSize: '1.08rem', letterSpacing: 0.1 }}>{color.message}</div>
        <div className="ai-recommendation-subtext" style={{ color: color.text, opacity: 0.5, fontSize: '0.95rem', fontWeight: 400 }}>AI-powered recommendation based on data analysis.</div>
      </div>
    </div>
  );
}

export default AIRecommendation; 