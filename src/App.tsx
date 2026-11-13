import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { CategoryExerciseSelector } from './components/CategoryExerciseSelector/CategoryExerciseSelector';
import type { ExerciseLogData } from './types';
import styles from './App.module.scss';

export function App() {
  const [currentUser, setCurrentUser] = useState<string>('Kseniia');
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'progress'>('workout');
  const [savedExercises, setSavedExercises] = useState<ExerciseLogData[]>([]);
  const [selectedProgressExercise, setSelectedProgressExercise] = useState<string>('');

  // Завантаження історії тренувань з localStorage при старті
  useEffect(() => {
    const user = localStorage.getItem('fitlog_current_user') || currentUser;
    setCurrentUser(user);
    const data = localStorage.getItem(`fitlog_saved_exercises_${user}`);
    if (data) {
      try {
        const parsed: ExerciseLogData[] = JSON.parse(data);
        setSavedExercises(parsed);
        if (parsed.length > 0) {
          setSelectedProgressExercise(parsed[0].exerciseName);
        }
      } catch (e) {
        console.error('Помилка парсингу історії тренувань', e);
      }
    }
  }, []);

  const handleSaveExercise = (data: { category: string; exerciseName: string; date: string; sets: { weight: number; reps: number }[] }) => {
    const existingIndex = savedExercises.findIndex(
      item => item.exerciseName === data.exerciseName && item.date === data.date
    );

    let updatedList: ExerciseLogData[];

    if (existingIndex !== -1) {
      const existingItem = savedExercises[existingIndex];
      const mergedSets = [...existingItem.sets, ...data.sets];
      const updatedItem: ExerciseLogData = {
        ...existingItem,
        sets: mergedSets
      };
      updatedList = [...savedExercises];
      updatedList[existingIndex] = updatedItem;
    } else {
      const newEntry: ExerciseLogData = {
        id: Date.now().toString(),
        ...data
      };
      updatedList = [newEntry, ...savedExercises];
    }

    setSavedExercises(updatedList);
    localStorage.setItem(`fitlog_saved_exercises_${currentUser}`, JSON.stringify(updatedList));
    setActiveTab('history');
  };

  const handleDeleteSaved = (id: string) => {
    const updatedList = savedExercises.filter(item => item.id !== id);
    setSavedExercises(updatedList);
    localStorage.setItem(`fitlog_saved_exercises_${currentUser}`, JSON.stringify(updatedList));
  };

  const handleLogout = () => {
    localStorage.removeItem('fitlog_current_user');
    window.location.reload();
  };

  // --- СТАТИСТИКА ТА ПРОГРЕС ---
  const totalSetsCount = savedExercises.reduce((acc, item) => acc + item.sets.length, 0);

  // Унікальні назви вправ
  const uniqueExerciseNames = Array.from(new Set(savedExercises.map(item => item.exerciseName)));

  // Дані для вибраної вправи (сортовані за хронологією)
  const currentExerciseName = selectedProgressExercise || uniqueExerciseNames[0];
  const exerciseProgressData = savedExercises
    .filter(item => item.exerciseName === currentExerciseName)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => {
      const maxWeight = Math.max(...item.sets.map(s => Number(s.weight) || 0), 0);
      return {
        date: item.date,
        maxWeight,
      };
    });

  // Абсолютний максимум для цієї вправи за весь час
  const overallMaxWeight = exerciseProgressData.length > 0 
    ? Math.max(...exerciseProgressData.map(i => i.maxWeight)) 
    : 0;

  // Налаштування для SVG-графіка
  const chartHeight = 160;
  const chartWidth = 320;
  const padding = 30;

  const weights = exerciseProgressData.map(d => d.maxWeight);
  const minW = Math.min(...weights, 0);
  const maxW = Math.max(...weights, 10);
  const rangeW = maxW - minW || 1;

  const points = exerciseProgressData.map((d, index) => {
    const x = exerciseProgressData.length === 1 
      ? chartWidth / 2 
      : padding + (index / (exerciseProgressData.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((d.maxWeight - minW) / rangeW) * (chartHeight - padding * 2);
    return { x, y, ...d };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className={styles.app}>
      <Header
        currentUser={currentUser}
        activeTab={activeTab === 'workout' ? 'add' : activeTab === 'history' ? 'saved' : 'progress'}
        setActiveTab={(tab) => {
          if (tab === 'add') setActiveTab('workout');
          if (tab === 'saved') setActiveTab('history');
          if (tab === 'progress') setActiveTab('progress');
        }}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        <div className={styles.container}>
          {activeTab === 'workout' && (
            <div className={styles.card} key="workout">
              <CategoryExerciseSelector onSave={handleSaveExercise} />
            </div>
          )}

          {activeTab === 'history' && (
            <div className={styles.card} key="history">
              <h2 className={styles.title}>Історія тренувань</h2>
              {savedExercises.length === 0 ? (
                <p className={styles.empty}>Історія тренувань поки порожня. Додайте першу вправу!</p>
              ) : (
                <div className={styles.historyList}>
                  {savedExercises.map((item) => (
                    <div key={item.id} className={styles.historyItem}>
                      <div className={styles.historyHeader}>
                        <div className={styles.exerciseInfo}>
                          <span className={styles.exerciseName}>{item.exerciseName}</span>
                          <span className={styles.categoryBadge}>{item.category}</span>
                        </div>
                        <div className={styles.exerciseMeta}>
                          <span className={styles.date}>{item.date}</span>
                          <button 
                            onClick={() => handleDeleteSaved(item.id)}
                            className={styles.deleteBtn}
                          >
                            Видалити
                          </button>
                        </div>
                      </div>
                      <div className={styles.setsTable}>
                        {item.sets.map((set, idx) => (
                          <div key={idx} className={styles.setBadge}>
                            <span className={styles.setNumber}>Підхід #{idx + 1}</span>
                            <div className={styles.setValues}>
                              <b>{set.weight}</b> кг × <b>{set.reps}</b> повт.
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className={styles.card} key="progress">
              <h2 className={styles.title}>Прогрес та динаміка</h2>
              {savedExercises.length === 0 ? (
                <p className={styles.empty}>Додайте тренування, щоб побачити графіки та прогрес ваги.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Загальні показники */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>Всього підходів</span>
                      <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-h)', margin: '4px 0 0 0' }}>{totalSetsCount}</p>
                    </div>
                    <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>Максимальна вага</span>
                      <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--accent)', margin: '4px 0 0 0' }}>{overallMaxWeight} кг</p>
                    </div>
                  </div>

                  {/* Вибір вправи */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Оберіть вправу для аналізу</label>
                    <select
                      value={currentExerciseName}
                      onChange={(e) => setSelectedProgressExercise(e.target.value)}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        color: 'var(--text-h)',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      {uniqueExerciseNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Графік зміни максимальної ваги */}
                  {exerciseProgressData.length > 0 && (
                    <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-h)', margin: '0' }}>Графік росту ваги: {currentExerciseName}</h3>
                      
                      {/* SVG Графік */}
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', background: 'var(--code-bg)', borderRadius: '8px', padding: '10px 0', border: '1px solid var(--border)' }}>
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '140px', overflow: 'visible' }}>
                          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="var(--border)" strokeWidth="1" />
                          <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="var(--border)" strokeWidth="1" />

                          {points.length > 1 && (
                            <polyline
                              fill="none"
                              stroke="var(--accent)"
                              strokeWidth="3"
                              points={polylinePoints}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}

                          {points.map((p, i) => (
                            <g key={i}>
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="var(--accent)"
                                stroke="var(--bg)"
                                strokeWidth="2"
                              />
                              <text
                                x={p.x}
                                y={p.y - 10}
                                fill="var(--text-h)"
                                fontSize="11"
                                textAnchor="middle"
                                fontWeight="600"
                              >
                                {p.maxWeight}кг
                              </text>
                              <text
                                x={p.x}
                                y={chartHeight - 10}
                                fill="var(--text)"
                                fontSize="9"
                                textAnchor="middle"
                              >
                                {p.date.slice(5)}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {exerciseProgressData.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--code-bg)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                            <span style={{ color: 'var(--text)' }}>{item.date}</span>
                            <span>Максимум: <b style={{ color: 'var(--accent)' }}>{item.maxWeight} кг</b></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;