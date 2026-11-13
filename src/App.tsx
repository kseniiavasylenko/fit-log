import React, { useState } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { CategoryExerciseSelector } from './components/CategoryExerciseSelector/CategoryExerciseSelector';
import { WorkoutRoutines } from './components/WorkoutRoutines/WorkoutRoutines';
import { registerUserDirectly, validateLoginDirectly } from './utils/authStorage';
import styles from './App.module.scss';
import { Dumbbell, Clock, Trash2 } from 'lucide-react';

interface WorkoutSet {
  weight: number;
  reps: number;
}

interface RoutineLoggedExercise {
  category: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

interface WorkoutSessionData {
  id: string;
  routineName: string;
  date: string;
  durationSeconds: number;
  exercises: RoutineLoggedExercise[];
}

export function App() {
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('fitlog_current_user') || '';
  });

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'progress' | 'routines'>('workout');

  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionData[]>(() => {
    const user = localStorage.getItem('fitlog_current_user');
    if (!user) return [];
    const data = localStorage.getItem(`fitlog_sessions_${user}`);
    try { 
      if (data) {
        return JSON.parse(data);
      }
      const oldData = localStorage.getItem(`fitlog_saved_exercises_${user}`);
      if (oldData) {
        const parsedOld = JSON.parse(oldData);
        const grouped: { [date: string]: WorkoutSessionData } = {};
        parsedOld.forEach((item: any) => {
          const date = item.date || '2026-11-13';
          if (!grouped[date]) {
            grouped[date] = {
              id: item.id || Date.now().toString(),
              routineName: 'Одиничне тренування',
              date,
              durationSeconds: 0,
              exercises: []
            };
          }
          grouped[date].exercises.push({
            category: item.category,
            exerciseName: item.exerciseName.replace(/\s*\([^)]+\)$/, ''),
            sets: item.sets
          });
        });
        return Object.values(grouped);
      }
    } catch {}
    return [];
  });

  const [selectedProgressExercise, setSelectedProgressExercise] = useState<string>(() => {
    if (workoutSessions.length > 0 && workoutSessions[0].exercises.length > 0) {
      return workoutSessions[0].exercises[0].exerciseName;
    }
    return '';
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const success = registerUserDirectly(emailInput, passwordInput);
    if (!success) {
      setErrorMsg('Користувач з такою поштою вже існує. Будь ласка, увійдіть.');
      return;
    }

    setEmailInput('');
    setPasswordInput('');
    setAuthMode('login');
    setSuccessMsg('Реєстрація успішна! Тепер увійдіть за допомогою вашої пошти та пароля.');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const isValid = validateLoginDirectly(emailInput, passwordInput);
    if (!isValid) {
      setErrorMsg('Невірна пошта або пароль.');
      return;
    }

    const email = emailInput.trim();
    localStorage.setItem('fitlog_current_user', email);
    setCurrentUser(email);

    const data = localStorage.getItem(`fitlog_sessions_${email}`);
    try {
      const parsed = data ? JSON.parse(data) : [];
      setWorkoutSessions(parsed);
      if (parsed.length > 0 && parsed[0].exercises.length > 0) {
        setSelectedProgressExercise(parsed[0].exercises[0].exerciseName);
      }
    } catch {
      setWorkoutSessions([]);
    }
  };

  // Збереження вправи з вкладки "Лог вправ"
  const handleSaveExercise = (data: { category: string; exerciseName: string; date: string; sets: { weight: number; reps: number }[] }) => {
    const newSession: WorkoutSessionData = {
      id: Date.now().toString(),
      routineName: data.exerciseName, // Використовуємо назву вправи як заголовок, якщо це одиничний лог
      date: data.date,
      durationSeconds: 0,
      exercises: [
        {
          category: data.category,
          exerciseName: data.exerciseName,
          sets: data.sets
        }
      ]
    };

    const updatedList = [newSession, ...workoutSessions];
    setWorkoutSessions(updatedList);
    localStorage.setItem(`fitlog_sessions_${currentUser}`, JSON.stringify(updatedList));
    setActiveTab('history');
  };

  // Збереження тренування за користувацькою програмою
  const handleFinishRoutineWorkout = (
    routineName: string,
    durationSeconds: number,
    loggedExercises: { category: string; exerciseName: string; date: string; sets: { weight: number; reps: number }[] }[]
  ) => {
    if (loggedExercises.length === 0) {
      setActiveTab('routines');
      return;
    }

    const newSession: WorkoutSessionData = {
      id: Date.now().toString(),
      routineName: routineName, // Точно записується назва програми, яку вказав користувач!
      date: loggedExercises[0].date,
      durationSeconds,
      exercises: loggedExercises.map(ex => ({
        category: ex.category,
        exerciseName: ex.exerciseName,
        sets: ex.sets
      }))
    };

    const updatedList = [newSession, ...workoutSessions];
    setWorkoutSessions(updatedList);
    localStorage.setItem(`fitlog_sessions_${currentUser}`, JSON.stringify(updatedList));
    setActiveTab('history');
  };

  const handleDeleteSession = (id: string) => {
    const updatedList = workoutSessions.filter(session => session.id !== id);
    setWorkoutSessions(updatedList);
    localStorage.setItem(`fitlog_sessions_${currentUser}`, JSON.stringify(updatedList));
  };

  const handleLogout = () => {
    localStorage.removeItem('fitlog_current_user');
    setCurrentUser('');
    setEmailInput('');
    setPasswordInput('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  // --- ЕКРАН АВТОРИЗАЦІЇ ---
  if (!currentUser) {
    return (
      <div className={styles.app}>
        <main className={styles.main} style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className={styles.card} style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', gap: '8px' }}>
              <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '14px', display: 'flex', color: '#fff', boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)' }}>
                <Dumbbell size={26} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-h)', margin: 0, letterSpacing: '0.5px' }}>
                Fit<span style={{ color: 'var(--accent)' }}>Log</span>
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0 }}>
                {authMode === 'login' ? 'Увійдіть у свій акаунт' : 'Створіть новий акаунт'}
              </p>
            </div>

            {successMsg && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>
                {successMsg}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="email"
                  placeholder="Ваша пошта..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                  required
                />
                <input
                  type="password"
                  placeholder="Ваш пароль..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                  required
                />
                {errorMsg && <span style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>{errorMsg}</span>}
                
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>
                  Увійти
                </button>

                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); setEmailInput(''); setPasswordInput(''); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Немає акаунта? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Зареєструватися</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="email"
                  placeholder="Ваша пошта..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                  required
                />
                <input
                  type="password"
                  placeholder="Придумайте пароль..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                  required
                />
                {errorMsg && <span style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>{errorMsg}</span>}
                
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>
                  Зареєструватися
                </button>

                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); setEmailInput(''); setPasswordInput(''); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Вже є акаунт? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Увійти</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- ОСНОВНИЙ ІНТЕРФЕЙС ---
  const totalSetsCount = workoutSessions.reduce(
    (acc, session) => acc + session.exercises.reduce((sAcc, ex) => sAcc + ex.sets.length, 0), 
    0
  );

  const allUniqueExerciseNames = Array.from(new Set(
    workoutSessions.flatMap(session => session.exercises.map(ex => ex.exerciseName))
  ));

  const currentExerciseName = selectedProgressExercise || allUniqueExerciseNames[0];

  const exerciseProgressData: { date: string; maxWeight: number }[] = [];
  workoutSessions.forEach(session => {
    session.exercises.forEach(ex => {
      if (ex.exerciseName === currentExerciseName) {
        const maxWeight = Math.max(...ex.sets.map(s => Number(s.weight) || 0), 0);
        exerciseProgressData.push({ date: session.date, maxWeight });
      }
    });
  });

  exerciseProgressData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const overallMaxWeight = exerciseProgressData.length > 0 
    ? Math.max(...exerciseProgressData.map(i => i.maxWeight)) 
    : 0;

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

  const formatSessionTime = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds <= 0) return null;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} сек`;
    return `${mins} хв ${secs > 0 ? `${secs} сек` : ''}`;
  };

  return (
    <div className={styles.app}>
      <Header
        currentUser={currentUser}
        activeTab={activeTab === 'workout' ? 'add' : activeTab === 'history' ? 'saved' : activeTab === 'progress' ? 'progress' : 'saved'}
        setActiveTab={(tab) => {
          if (tab === 'add') setActiveTab('workout');
          if (tab === 'saved') setActiveTab('history');
          if (tab === 'progress') setActiveTab('progress');
        }}
        onLogout={handleLogout}
      />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 16px 0 16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('workout')}
          style={{ background: activeTab === 'workout' ? 'var(--accent)' : 'var(--code-bg)', color: '#fff', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
        >
          ➕ Лог вправ
        </button>
        <button
          onClick={() => setActiveTab('routines')}
          style={{ background: activeTab === 'routines' ? 'var(--accent)' : 'var(--code-bg)', color: '#fff', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
        >
          📋 Мої програми
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{ background: activeTab === 'history' ? 'var(--accent)' : 'var(--code-bg)', color: '#fff', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
        >
          📜 Історія
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          style={{ background: activeTab === 'progress' ? 'var(--accent)' : 'var(--code-bg)', color: '#fff', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
        >
          📈 Прогрес
        </button>
      </div>

      <main className={styles.main}>
        <div className={styles.container}>
          {activeTab === 'workout' && (
            <div className={styles.card} key="workout">
              <CategoryExerciseSelector onSave={handleSaveExercise} />
            </div>
          )}

          {activeTab === 'routines' && (
            <div className={styles.card} key="routines">
              <WorkoutRoutines currentUser={currentUser} onFinishRoutineWorkout={handleFinishRoutineWorkout} />
            </div>
          )}

          {activeTab === 'history' && (
            <div className={styles.card} key="history">
              <h2 className={styles.title}>Історія тренувань</h2>
              {workoutSessions.length === 0 ? (
                <p className={styles.empty}>Історія тренувань поки порожня. Розпочніть програму або додайте вправу!</p>
              ) : (
                <div className={styles.historyList}>
                  {workoutSessions.map((session) => {
                    const timeLabel = formatSessionTime(session.durationSeconds);

                    return (
                      <div key={session.id} className={styles.historyItem} style={{ marginBottom: '20px', background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-h)', display: 'block' }}>
                              🏋️‍♂️ {session.routineName}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                            <span className={styles.date} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                              {session.date} 
                              {timeLabel && <span style={{ opacity: 0.4 }}>•</span>} 
                              {timeLabel && (
                                <span style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <Clock size={12} /> {timeLabel}
                                </span>
                              )}
                            </span>
                            <button 
                              onClick={() => handleDeleteSession(session.id)} 
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                              title="Видалити тренування"
                            >
                              <Trash2 size={14} /> Видалити
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {session.exercises.map((ex, exIdx) => (
                            <div key={exIdx} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
                                  {ex.exerciseName}
                                </span>
                                <span className={styles.categoryBadge} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--accent)' }}>
                                  {ex.category}
                                </span>
                              </div>

                              <div className={styles.setsTable} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {ex.sets.map((set, sIdx) => (
                                  <div key={sIdx} className={styles.setBadge} style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: '8px', fontSize: '12px' }}>
                                    <span style={{ opacity: 0.7, marginRight: '4px' }}>#{sIdx + 1}:</span>
                                    <b>{set.weight}</b> кг × <b>{set.reps}</b> повт.
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className={styles.card} key="progress">
              <h2 className={styles.title}>Прогрес та динаміка</h2>
              {workoutSessions.length === 0 ? (
                <p className={styles.empty}>Додайте тренування, щоб побачити графіки та прогрес ваги.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Оберіть вправу для аналізу</label>
                    <select
                      value={currentExerciseName}
                      onChange={(e) => setSelectedProgressExercise(e.target.value)}
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                    >
                      {allUniqueExerciseNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {exerciseProgressData.length > 0 && (
                    <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-h)', margin: '0' }}>Графік росту ваги: {currentExerciseName}</h3>
                      
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
                              <circle cx={p.x} cy={p.y} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
                              <text x={p.x} y={p.y - 10} fill="var(--text-h)" fontSize="11" textAnchor="middle" fontWeight="600">{p.maxWeight}кг</text>
                              <text x={p.x} y={chartHeight - 10} fill="var(--text)" fontSize="9" textAnchor="middle">{p.date.slice(5)}</text>
                            </g>
                          ))}
                        </svg>
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