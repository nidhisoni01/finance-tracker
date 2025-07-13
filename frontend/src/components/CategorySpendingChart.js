import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#6366f1', // muted indigo
  '#f59e42', // muted orange
  '#10b981', // muted green
  '#818cf8', // muted blue
  '#a3a3a3', // muted gray
  '#eab308', // muted gold
  '#f472b6', // muted pink
  '#f87171', // muted red
  '#64748b', // slate
  '#fbbf24', // muted yellow
];

export default function CategorySpendingChart({ data }) {
  // const { theme } = useTheme();
  // const isDark = theme === 'dark';
  // const chartBg = isDark ? '#181c23' : '#fff';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={400} height={400}>
        {/* Removed <rect> background for seamless blending */}
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          fill="#8884d8"
          label={({ name, index }) => (
            <span style={{
              fill: COLORS[index % COLORS.length],
              fontWeight: 500,
              fontSize: 14,
              opacity: 0.85
            }}>{name}</span>
          )}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip formatter={v => `$${v}`} />
        <Legend layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  );
} 
