import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

export const WeightChart: React.FC<Props> = ({ profile }) => {
  // Simulating a history based on current snapshot for visualization
  const data = [
    { name: 'Início', weight: profile.startWeight },
    { name: 'Atual', weight: profile.currentWeight },
    { name: 'Meta', weight: profile.goalWeight },
  ];

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#9ca3af" />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};