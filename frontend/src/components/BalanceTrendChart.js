import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function BalanceTrendChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const axisColor = isDark ? '#e5e7eb' : '#374151'; // light gray in dark, dark gray in light
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="month" padding={{ left: 24, right: 24 }} stroke={axisColor} tick={{ fill: axisColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} />
        <YAxis domain={['dataMin - 100', 'dataMax + 100']} padding={{ top: 16, bottom: 16 }} stroke={axisColor} tick={{ fill: axisColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} />
        <Tooltip contentStyle={{ background: isDark ? '#181c23' : '#fff', color: axisColor, border: '1px solid ' + gridColor }} labelStyle={{ color: axisColor }} itemStyle={{ color: axisColor }} />
        <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: isDark ? '#6366f1' : '#6366f1', stroke: axisColor, strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
} 