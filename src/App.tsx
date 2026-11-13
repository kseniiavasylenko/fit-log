import React, { useState } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { CategoryExerciseSelector } from './components/CategoryExerciseSelector/CategoryExerciseSelector';
import type { ExerciseLogData } from './types';
import { registerUserDirectly, validateLoginDirectly } from './utils/authStorage';
import styles from './App.module.scss';
import { Dumbbell } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('fitlog_current_user') || '';
  });

  // Режим: 'login' або 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Поля форм
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // Повідомлення про успішну реєстрацію

  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'progress'>('workout');

  const [savedExercises, setSavedExercises] = useState<ExerciseLogData[]>(() => {
    const user = localStorage.getItem('fitlog_current_user');
    if (!user) return [];
    const data = localStorage.getItem(`fitlog_saved_exercises_${user}`);
    try { return data ? JSON.parse(data) : []; } catch { return []; }
  });

  const [selectedProgressExercise, setSelectedProgressExercise] = useState<string>(() => {
    const user = localStorage.getItem('fitlog_current_user');
    if (!user) return '';
    const data = localStorage.getItem(`fitlog_saved_exercises_${user}`);
    if (data) {
      try {
        const parsed: ExerciseLogData[] = JSON.parse(data);
        if (parsed.length > 0) return parsed[0].exerciseName;
      } catch {}
    }
    return '';
  });

  // Обробка реєстрації (теперь перекидає на вкладку входу)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const success = registerUserDirectly(emailInput, passwordInput);
    if (!success) {
      setErrorMsg('Користувач з такою поштою вже існує. Будь ласка, увійдіть.');
      return;
    }

    // Успішно зареєстрували, очищаємо поля, перемикаємо на логін і виводимо успіх
    setEmailInput('');
    setPasswordInput('');
    setAuthMode('login');
    setSuccessMsg('Реєстрація успішна! Тепер увійдіть за допомогою вашої пошти та пароля.');
  };

  // Обробка входу
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

    const data = localStorage.getItem(`fitlog_saved_exercises_${email}`);
    try {
      const parsed = data ? JSON.parse(data) : [];
      setSavedExercises(parsed);
      if (parsed.length > 0) setSelectedProgressExercise(parsed[0].exerciseName);
    } catch {
      setSavedExercises([]);
    }
  };

  const handleSaveExercise = (data: { category: string; exerciseName: string; date: string; sets: { weight: number; reps: number }[] }) => {
    const existingIndex = savedExercises.findIndex(
      item => item.exerciseName === data.exerciseName && item.date === data.date
    );

    let updatedList: ExerciseLogData[];
    if (existingIndex !== -1) {
      const existingItem = savedExercises[existingIndex];
      const mergedSets = [...existingItem.sets, ...data.sets];
      updatedList = [...savedExercises];
      updatedList[existingIndex] = { ...existingItem, sets: mergedSets };
    } else {
      updatedList = [{ id: Date.now().toString(), ...data }, ...savedExercises];
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
            
            {/* Блок Логотипу */}
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

            {/* Вивід повідомлення про успішну реєстрацію */}
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
  const totalSetsCount = savedExercises.reduce((acc, item) => acc + item.sets.length, 0);
  const uniqueExerciseNames = Array.from(new Set(savedExercises.map(item => item.exerciseName)));

  const currentExerciseName = selectedProgressExercise || uniqueExerciseNames[0];
  const exerciseProgressData = savedExercises
    .filter(item => item.exerciseName === currentExerciseName)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => {
      const maxWeight = Math.max(...item.sets.map(s => Number(s.weight) || 0), 0);
      return { date: item.date, maxWeight };
    });

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
                          <button onClick={() => handleDeleteSaved(item.id)} className={styles.deleteBtn}>
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
                      {uniqueExerciseNames.map(name => (
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