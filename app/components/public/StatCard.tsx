interface StatCardProps {
  value: number | string | undefined;
  label: string;
  loading?: boolean;
}

export default function StatCard({
  value,
  label,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  const formatValue = (val: number | string | undefined): string => {
    if (val === undefined) {
      return "0";
    }
    if (typeof val === "number") {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/15 transition-all duration-200">
      <div
        className="text-3xl md:text-4xl font-bold mb-2"
        style={{ color: "var(--stats-text-color)" }}
      >
        {formatValue(value)}
      </div>
      <div 
        className="text-sm md:text-base font-medium"
        style={{ color: "var(--stats-text-color)" }}
      >
        {label}
      </div>
    </div>
  );
}
