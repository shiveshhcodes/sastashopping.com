import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

const COLORS = {
  line: '#6a6ee7',
  optimal: '#38cb89',
  dot: '#6a6ee7',
};

const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'April'];

function generateRandomChartData() {
  // Generate a random walk for price data
  let price = Math.floor(Math.random() * 60) + 450; // Start between 450-510
  const data = [];
  for (let i = 0; i < MONTHS.length; i++) {
    // Randomly go up or down
    const change = Math.floor(Math.random() * 60) - 20; // -20 to +40
    price = Math.max(440, Math.min(600, price + change));
    data.push({ month: MONTHS[i], price });
  }
  return data;
}

function findOptimalPoints(data) {
  if (!data || !data.length) return [];
  const minPrice = Math.min(...data.map(d => d.price));
  return data.filter(d => d.price === minPrice);
}

function PriceHistoryChart() {
  // Generate new random data on each mount
  const data = useMemo(() => generateRandomChartData(), []);
  const optimalPoints = findOptimalPoints(data);
  return (
    <div className="price-history-chart-container">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 24, right: 32, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis dataKey="month" tick={{ fontSize: 14, fill: '#888' }} />
          <YAxis tick={{ fontSize: 14, fill: '#888' }} domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 15 }} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={COLORS.line}
            strokeWidth={3}
            dot={{ r: 6, stroke: COLORS.dot, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 9, fill: COLORS.line, stroke: '#fff', strokeWidth: 3 }}
            isAnimationActive={true}
            animationDuration={1200}
          />
          {optimalPoints.map((point, idx) => (
            <ReferenceDot
              key={idx}
              x={point.month}
              y={point.price}
              r={11}
              fill={COLORS.optimal}
              stroke="#fff"
              strokeWidth={3}
              isFront
              label={{ value: 'Best', position: 'top', fill: COLORS.optimal, fontWeight: 700, fontSize: 14 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceHistoryChart; 