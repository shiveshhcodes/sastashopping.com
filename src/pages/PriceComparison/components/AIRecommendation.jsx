import React from 'react';
import { Sparkle } from 'lucide-react';
import './AIRecommendation.css';

const colorMap = {
  buy: {
    bg: 'rgba(56, 203, 137, 0.13)',
    border: '#38cb89',
    icon: '#38cb89',
    text: '#1e251f',
  },
  wait: {
    bg: 'rgba(255, 193, 7, 0.13)',
    border: '#ffc107',
    icon: '#ffc107',
    text: '#7a5d00',
  },
  avoid: {
    bg: 'rgba(255, 87, 87, 0.13)',
    border: '#ff5757',
    icon: '#ff5757',
    text: '#7a1f1f',
  },
};

function AIRecommendation({ type = 'buy', message = '', subtext = 'AI-powered recommendation based on data analysis.' }) {
  const color = colorMap[type] || colorMap.buy;
  return (
    <div
      className="ai-recommendation-modern d-flex align-items-center gap-3 p-4 mb-0"
      style={{
        background: color.bg,
        border: `1.5px solid ${color.border}`,
        color: color.text,
        boxShadow: 'none',
        fontFamily: 'inherit',
      }}
    >
      <div className="ai-icon-pulse" style={{ color: color.icon, borderColor: color.border, width: 40, height: 40 }}>
        <Sparkle size={26} />
      </div>
      <div>
        <div className="fw-normal fs-6 mb-1" style={{ color: color.text, fontWeight: 500, fontSize: '1.08rem', letterSpacing: 0.1 }}>{message}</div>
        <div className="ai-recommendation-subtext" style={{ color: color.text, opacity: 0.5, fontSize: '0.95rem', fontWeight: 400 }}>{subtext}</div>
      </div>
    </div>
  );
}

export default AIRecommendation; 