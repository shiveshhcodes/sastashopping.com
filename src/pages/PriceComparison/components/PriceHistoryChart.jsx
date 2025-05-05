import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, LabelList } from 'recharts';

const COLORS = {
  line: '#6a6ee7',
  optimal: '#38cb89',
  dot: '#6a6ee7',
  bestTime: '#6c5ce7',
};

function getRecentMonths(num = 7) {
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  let idx = now.getMonth();
  let year = now.getFullYear();
  const arr = [];
  for (let i = num - 1; i >= 0; i--) {
    let d = new Date(year, idx - i, 1);
    arr.push(monthsShort[d.getMonth()]);
  }
  return arr;
}

function generateRandomChartData(months) {
  let price = Math.floor(Math.random() * 60) + 450; // Start between 450-510
  const data = [];
  for (let i = 0; i < months.length; i++) {
    const change = Math.floor(Math.random() * 60) - 20; // -20 to +40
    price = Math.max(440, Math.min(600, price + change));
    data.push({ month: months[i], price });
  }
  return data;
}

function findOptimalPoints(data) {
  if (!data || !data.length) return [];
  const minPrice = Math.min(...data.map(d => d.price));
  return data.filter(d => d.price === minPrice);
}

function findBestTimePoints(data) {
  if (!data || data.length < 3) return [];
  const bestTimes = [];
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i].price < data[i - 1].price && data[i].price < data[i + 1].price) {
      bestTimes.push(data[i]);
    }
  }
  return bestTimes;
}

function PriceHistoryChart() {
  const months = useMemo(() => getRecentMonths(7), []);
  const data = useMemo(() => generateRandomChartData(months), [months]);
  const optimalPoints = findOptimalPoints(data);
  const bestTimePoints = findBestTimePoints(data);

  // Helper to avoid label overlap: only show one label per dot type per month
  const labelOffset = -18;
  const labelOffsetBestTime = -36;

  return (
    <div className="price-history-chart-container">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 32, right: 32, left: 8, bottom: 8 }}>
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
              key={"best-" + idx}
              x={point.month}
              y={point.price}
              r={11}
              fill={COLORS.optimal}
              stroke="#fff"
              strokeWidth={3}
              isFront
              label={{ value: 'Best', position: 'top', fill: COLORS.optimal, fontWeight: 700, fontSize: 14, offset: labelOffset }}
            />
          ))}
          {bestTimePoints.map((point, idx) => (
            <ReferenceDot
              key={"besttime-" + idx}
              x={point.month}
              y={point.price}
              r={10}
              fill={COLORS.bestTime}
              stroke="#fff"
              strokeWidth={3}
              isFront
              label={{ value: 'Best Time', position: 'top', fill: COLORS.bestTime, fontWeight: 700, fontSize: 13, offset: labelOffsetBestTime }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceHistoryChart; 