import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#38cb89', '#6a6ee7', '#ffc107', '#ff5757', '#6c757d'];

function getRandomDemoData() {
  const retailers = ['Amazon', 'Flipkart', 'Walmart', 'Myntra', 'BestBuy'];
  let remaining = 100;
  const data = retailers.map((name, idx) => {
    let value = idx === retailers.length - 1 ? remaining : Math.floor(Math.random() * (remaining / 2)) + 10;
    remaining -= value;
    return { name, value: Math.max(value, 5) };
  });
  // Normalize to 100
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return data.map(d => ({ ...d, value: Math.round((d.value / total) * 100) }));
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#222" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight={600}>
      {name}
    </text>
  );
};

function PriceComparisonPieChart({ keySeed }) {
  // Regenerate data on each new product (keySeed changes)
  const data = useMemo(() => getRandomDemoData(), [keySeed]);
  return (
    <div className="price-pie-chart-container mb-4">
      <h5 className="fw-bold mb-3" style={{ color: '#222' }}>Price Distribution Across Retailers</h5>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={90}
            fill="#38cb89"
            dataKey="value"
            isAnimationActive={true}
            animationDuration={900}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend verticalAlign="bottom" height={36} iconType="circle"/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceComparisonPieChart; 