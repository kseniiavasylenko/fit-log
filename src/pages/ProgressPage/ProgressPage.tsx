import React, { useState } from 'react';
import { LineChart as ChartIcon, Trophy, TrendingUp, Dumbbell } from 'lucide-react';
import styles from './ProgressPage.module.scss';

interface SetItem {
  id: string;
  weight: string;
  reps: string;
}

interface SavedExerciseLog {
  id: string;
  exerciseName: string;
  photoUrl: string;
  sets: SetItem[];
  date: string;
}

interface ProgressPageProps {
  logs: SavedExerciseLog[];
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ logs }) => {
  const uniqueExerciseNames = Array.from(new Set(logs.map((log) => log.exerciseName)));
  const [selectedExercise, setSelectedExercise] = useState<string>(uniqueExerciseNames[0] || '');

  // Фільтруємо і сортуємо логи за хронологією (від старих до нових для графіка)
  const exerciseLogs = logs
    .filter((log) => log.exerciseName.toLowerCase() === selectedExercise.toLowerCase())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Рахуємо максимальну вагу та підготуємо дані для графіка (дата + максимальна вага за це тренування)
  let maxWeightOverall = 0;
  const chartData = exerciseLogs.map((log) => {
    let sessionMax = 0;
    log.sets.forEach((set) => {
      const w = parseFloat(set.weight) || 0;
      if (w > sessionMax) sessionMax = w;
    });
    if (sessionMax > maxWeightOverall) maxWeightOverall = sessionMax;

    // Скорочуємо дату до формату ДД.ММ
    const shortDate = log.date.split(' ')[0];
    return { date: shortDate, maxWeight: sessionMax };
  });

  // Налаштування для простого SVG-графіка
  const svgHeight = 160;
  const svgWidth = 500;
  const padding = 30;

  const maxW = Math.max(...chartData.map(d => d.maxWeight), 10);
  const points = chartData.map((d, index) => {
    const x = chartData.length === 1 
      ? svgWidth / 2 
      : padding + (index / (chartData.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - (d.maxWeight / maxW) * (svgHeight - padding * 2);
    return { x, y, ...d };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>
            <ChartIcon className={styles.titleIcon} /> Прогрес та аналітика
          </h2>
          <p className={styles.subtitle}>Відстежуй зростання своїх силових показників</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className={styles.emptyCard}>
          <Dumbbell className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Ще немає даних для аналізу.</p>
          <p className={styles.emptySubtitle}>Додай кілька вправ у розділі «Додати вправу», щоб побачити свій прогрес.</p>
        </div>
      ) : (
        <>
          {/* Вибір вправи */}
          <div className={styles.filterSection}>
            <label className={styles.label}>Обери вправу для перегляду:</label>
            <div className={styles.exerciseChips}>
              {uniqueExerciseNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedExercise(name)}
                  className={`${styles.chip} ${selectedExercise === name ? styles.chipActive : ''}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Картки статистики */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Trophy className={styles.statIcon} />
              </div>
              <div>
                <p className={styles.statLabel}>Максимальна вага</p>
                <p className={styles.statValue}>{maxWeightOverall} <span className={styles.unit}>кг</span></p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <TrendingUp className={styles.statIcon} />
              </div>
              <div>
                <p className={styles.statLabel}>Всього тренувань</p>
                <p className={styles.statValue}>{exerciseLogs.length}</p>
              </div>
            </div>
          </div>

          {/* Графік прогресу */}
          <div className={styles.chartSection}>
            <h3 className={styles.sectionTitle}>Динаміка ваги: {selectedExercise}</h3>
            
            <div className={styles.chartCard}>
              {chartData.length < 2 ? (
                <div className={styles.chartNotice}>
                  <p>Потрібно щонайменше 2 записи для побудови лінії прогресу. Додай ще одне тренування з цією вправою!</p>
                </div>
              ) : (
                <div className={styles.svgContainer}>
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className={styles.svgGraph}>
                    {/* Сітка фону */}
                    <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#334155" strokeWidth="1" />
                    
                    {/* Лінія графіка */}
                    <polyline
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={polylinePoints}
                    />

                    {/* Точки на графіку */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="5"
                          fill="#6366f1"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {p.maxWeight}кг
                        </text>
                        <text
                          x={p.x}
                          y={svgHeight - 10}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="9"
                        >
                          {p.date}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};