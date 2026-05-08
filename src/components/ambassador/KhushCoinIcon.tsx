import * as React from "react";

interface KhushCoinIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const watermarkRows = [
  { x: -50, y: 100 },
  { x: -150, y: 210 },
  { x: -50, y: 320 },
  { x: -100, y: 430 },
  { x: -50, y: 540 },
  { x: -150, y: 650 },
];

const impactFont = "Impact, 'Arial Black', sans-serif";
const monoFont = "'Courier New', monospace";
const twelnyFont = "'Twelny', 'Arial Black', sans-serif";

export function KhushCoinIcon({ size = 32, className, ...props }: KhushCoinIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <clipPath id="khushcoin-clip">
          <circle cx={300} cy={300} r={290} />
        </clipPath>
      </defs>

      <circle cx={300} cy={300} r={290} fill="#C8FF00" stroke="#0B0B0B" strokeWidth={14} />

      <g
        clipPath="url(#khushcoin-clip)"
        fill="#0B0B0B"
        opacity={0.12}
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={130}
        transform="rotate(-6 300 300)"
      >
        {watermarkRows.map((row) => (
          <text key={`${row.x}-${row.y}`} x={row.x} y={row.y}>
            KHUSHKHUSH
          </text>
        ))}
      </g>

      <circle cx={300} cy={300} r={275} fill="none" stroke="#0B0B0B" strokeWidth={3} opacity={0.3} />

      <g transform="translate(0 -15)">
        <g transform="rotate(-3 300 240)">
          <rect x={96} y={206} width={408} height={80} fill="#FFFFFF" />
          <rect
            x={90}
            y={200}
            width={420}
            height={80}
            fill="#0B0B0B"
            stroke="#0B0B0B"
            strokeWidth={4}
          />
          <text
            x={300}
            y={262}
            fill="#C8FF00"
            fontFamily={twelnyFont}
            fontWeight={900}
            fontSize={65}
            textAnchor="middle"
            letterSpacing={1}
          >
            KHUSHKHUSH.
          </text>
        </g>

        <g transform="translate(170 310)">
          <rect x={-6} y={6} width={260} height={50} fill="#0B0B0B" />
          <rect
            x={0}
            y={0}
            width={260}
            height={50}
            fill="#FFFFFF"
            stroke="#0B0B0B"
            strokeWidth={4}
          />
          <text
            x={130}
            y={34}
            fill="#0B0B0B"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={24}
            textAnchor="middle"
            letterSpacing={1}
          >
            ◎ 1.00 KHUSHCOIN
          </text>
        </g>

        <rect x={245} y={390} width={110} height={35} fill="#0B0B0B" />
        <text
          x={300}
          y={413}
          fill="#C8FF00"
          fontFamily={monoFont}
          fontWeight={900}
          fontSize={14}
          textAnchor="middle"
        >
          EST. 2026
        </text>
      </g>
    </svg>
  );
}
