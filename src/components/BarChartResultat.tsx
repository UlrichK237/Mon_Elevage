import React from 'react';
import { CalculsBande } from '../utils/calculs';
import { formatFCFA } from '../utils/format';

interface BarChartResultatProps {
  bandes: CalculsBande[];
}

export function BarChartResultat({ bandes }: BarChartResultatProps) {
  const cloturees = bandes.filter((b) => b.bande.statut === 'cloturee');

  if (cloturees.length === 0) {
    return (
      <p className="text-sm text-slate-600 py-4">
        Le graphique affichera le résultat (vert pour un gain, rouge pour une perte) dès que vous aurez clôturé au moins une bande.
      </p>
    );
  }

  const maxAbs = Math.max(
    1,
    ...cloturees.map((b) => Math.abs(b.resultat))
  );

  const width = Math.max(320, cloturees.length * 86 + 40);
  const height = 220;
  const topPad = 28;
  const bottomPad = 48;
  const plotHeight = height - topPad - bottomPad;
  const hasNegatives = cloturees.some((b) => b.resultat < 0);
  const hasPositives = cloturees.some((b) => b.resultat > 0);

  const zeroY =
    hasNegatives && hasPositives
      ? topPad + plotHeight * 0.55
      : hasNegatives
      ? topPad + 8
      : topPad + plotHeight;

  const maxPosSpace = zeroY - topPad;
  const maxNegSpace = topPad + plotHeight - zeroY;

  const barAreaWidth = (width - 32) / cloturees.length;
  const barWidth = Math.min(44, Math.max(24, barAreaWidth * 0.55));

  return (
    <div className="w-full overflow-x-auto pb-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[300px] h-auto select-none"
        role="img"
        aria-label="Graphique du résultat financier des bandes clôturées"
      >
        <line
          x1={16}
          y1={zeroY}
          x2={width - 16}
          y2={zeroY}
          stroke="#64748B"
          strokeWidth={1.5}
        />

        {cloturees.map((item, index) => {
          const isPositive = item.resultat >= 0;
          const ratio = Math.abs(item.resultat) / maxAbs;
          const barHeight = Math.max(
            4,
            ratio * (isPositive ? maxPosSpace : maxNegSpace)
          );
          const centerX = 16 + index * barAreaWidth + barAreaWidth / 2;
          const x = centerX - barWidth / 2;
          const y = isPositive ? zeroY - barHeight : zeroY;
          const fill = isPositive ? '#15803D' : '#B91C1C';
          const shortName =
            item.bande.nom.length > 12
              ? item.bande.nom.slice(0, 11) + '…'
              : item.bande.nom;

          const labelAmount =
            Math.abs(item.resultat) >= 1000
              ? `${item.resultat < 0 ? '-' : ''}${Math.round(
                  Math.abs(item.resultat) / 1000
                )}k`
              : String(Math.round(item.resultat));

          const valueY = isPositive
            ? Math.max(14, y - 6)
            : Math.min(height - bottomPad + 14, y + barHeight + 14);

          return (
            <g key={item.bande.id}>
              <title>
                {item.bande.nom} : {formatFCFA(item.resultat)}
              </title>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={fill}
              />
              <text
                x={centerX}
                y={valueY}
                textAnchor="middle"
                fontSize={11}
                fontWeight="700"
                fill={fill}
              >
                {labelAmount}
              </text>
              <text
                x={centerX}
                y={height - 22}
                textAnchor="middle"
                fontSize={11}
                fontWeight="600"
                fill="#1E293B"
              >
                {shortName}
              </text>
              <text
                x={centerX}
                y={height - 8}
                textAnchor="middle"
                fontSize={10}
                fill="#64748B"
              >
                Clôturée
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
