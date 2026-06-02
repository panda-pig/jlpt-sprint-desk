import { useMemo } from "react";
import { t } from "../i18n";

interface TrendChartProps {
  data: { date: string; value: number; target?: number }[];
  maxValue?: number;
  color?: string;
  targetColor?: string;
  height?: number;
}

export function TrendChart({ data, maxValue, color = "#315f4f", targetColor = "#b77a20", height = 160 }: TrendChartProps) {
  const chartData = useMemo(() => {
    const max = maxValue || Math.max(...data.map((d) => d.value), ...data.map((d) => d.target || 0), 1);
    return data.map((item) => ({
      ...item,
      height: (item.value / max) * 100,
      targetHeight: item.target ? (item.target / max) * 100 : 0,
    }));
  }, [data, maxValue]);

  const barWidth = Math.max(20, Math.min(40, 280 / chartData.length));
  const gap = 8;
  const totalWidth = chartData.length * (barWidth + gap);

  return (
    <svg width={totalWidth} height={height} viewBox={`0 0 ${totalWidth} ${height}`} style={{ maxWidth: "100%" }}>
      {chartData[0]?.target !== undefined && (
        <line
          x1="0"
          y1={height - (chartData[0].targetHeight / 100) * height}
          x2={totalWidth}
          y2={height - (chartData[0].targetHeight / 100) * height}
          stroke={targetColor}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.6"
        />
      )}

      {chartData.map((item, index) => {
        const x = index * (barWidth + gap);
        const barHeight = (item.height / 100) * height;
        const y = height - barHeight;

        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={color}
              opacity={item.value > 0 ? 1 : 0.3}
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#70817a"
            >
              {item.value > 0 ? Math.round(item.value) : "-"}
            </text>
            <text
              x={x + barWidth / 2}
              y={height - 4}
              textAnchor="middle"
              fontSize="10"
              fill="#70817a"
            >
              {item.date.slice(5).replace("-", "/")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function PieChart({ data, size = 120 }: PieChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const segments = useMemo(() => {
    return data.map((item, i) => {
      const angle = (item.value / total) * 360;
      const startAngle = data.slice(0, i).reduce((sum, d) => sum + (d.value / total) * 360, 0);
      return { ...item, startAngle, angle };
    });
  }, [data, total]);

  const radius = size / 2;
  const center = size / 2;

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", x, y, "L", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "Z"].join(" ");
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((segment, index) => (
        <path
          key={index}
          d={describeArc(center, center, radius - 4, segment.startAngle, segment.startAngle + segment.angle)}
          fill={segment.color}
          stroke="white"
          strokeWidth="2"
        />
      ))}
      <circle cx={center} cy={center} r={radius * 0.45} fill="white" />
      <text x={center} y={center - 4} textAnchor="middle" fontSize="14" fontWeight="600" fill="#182522">
        {total}
      </text>
      <text x={center} y={center + 10} textAnchor="middle" fontSize="9" fill="#70817a">
        {t("common.total")}
      </text>
    </svg>
  );
}

interface RadarChartProps {
  data: { label: string; value: number; max: number }[];
  size?: number;
}

export function RadarChart({ data, size = 160 }: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 20;
  const angleStep = (2 * Math.PI) / data.length;

  const points = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const ratio = item.value / item.max;
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    return { x, y, label: item.label, value: item.value };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <circle
          key={ratio}
          cx={center}
          cy={center}
          r={radius * ratio}
          fill="none"
          stroke="#dbe3df"
          strokeWidth="1"
          opacity="0.5"
        />
      ))}

      {data.map((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="#dbe3df" strokeWidth="1" opacity="0.5" />;
      })}

      <polygon points={polygonPoints} fill="rgba(49, 95, 79, 0.15)" stroke="#315f4f" strokeWidth="2" />

      {points.map((point, index) => (
        <g key={index}>
          <circle cx={point.x} cy={point.y} r="4" fill="#315f4f" stroke="white" strokeWidth="2" />
          <text
            x={point.x + (point.x > center ? 8 : -8)}
            y={point.y}
            textAnchor={point.x > center ? "start" : "end"}
            fontSize="9"
            fill="#70817a"
            dy="3"
          >
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
