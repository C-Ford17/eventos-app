// src/components/StatWidget.tsx
interface StatWidgetProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}

export default function StatWidget({ title, value, icon }: StatWidgetProps) {
  return (
    <div className="bg-blue-100 p-4 rounded shadow flex items-center gap-4">
      <div className="text-blue-600 text-3xl">{icon}</div>
      <div>
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
