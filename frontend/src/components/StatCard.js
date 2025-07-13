export default function StatCard({ title, value, icon, color, trend }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-2 min-w-[200px]">
      <div className="flex items-center gap-2">
        <span className={`text-2xl ${color}`}>{icon}</span>
        <span className="text-gray-500 dark:text-gray-400 font-medium">{title}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      {trend && <div className="text-xs text-gray-400 dark:text-gray-500">{trend}</div>}
    </div>
  );
} 