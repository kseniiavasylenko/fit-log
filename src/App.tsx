import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { CategoryExerciseSelector } from './components/CategoryExerciseSelector/CategoryExerciseSelector';
import type { ExerciseLogData } from './types';
import { registerNewUser, completeRegistration, validateLogin, getAllUsers } from './utils/authStorage';
import styles from './App.module.scss';

export function App() {
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('fitlog_current_user') || '';
  });

  // Екрани авторизації: 'login' | 'register-form' | 'success-sent' | 'set-password'
  const [authView, setAuthView] = useState<'login' | 'register-form' | 'success-sent' | 'set-password'>('login');

  // Поля форм
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [activeToken, setActiveToken] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  // Перевірка URL на наявність токену з листа (симуляція переходу за посиланням)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setActiveToken(token);
      setAuthView('set-password');
    }
  }, []);

  // Обробка відправки форми реєстрації (Крок 1)
  const handleRegisterRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const token = registerNewUser(regName.trim(), regEmail.trim());
    if (!token) {
      setErrorMsg('Користувач з такою поштою вже зареєстрований.');
      return;
    }

    setSuccessMsg(`Лист успішно надіслано на ${regEmail}! Загляньте у консоль (F12), щоб отримати посилання для активації.`);
    setAuthView('success-sent');
  };

  // Завершення реєстрації та створення пароля (Крок 2)
  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeToken) return;

    const success = completeRegistration(activeToken, newPassword);
    if (!success) {
      setErrorMsg('Недійсний або прострочений токен активації.');
      return;
    }

    alert('Реєстрація успішно завершена! Тепер ви можете увійти за допомогою пошти та пароля.');
    // Очищаємо URL від параметрів
    window.history.replaceState({}, document.title, window.location.pathname);
    setActiveToken(null);
    setAuthView('login');
    setSuccessMsg('');
  };

  // Вхід у систему за поштою та паролем
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const name = validateLogin(loginEmail.trim(), loginPassword);
    if (!name) {
      setErrorMsg('Невірна пошта, пароль або акаунт не активовано через пошту.');
      return;
    }

    localStorage.setItem('fitlog_current_user', name);
    setCurrentUser(name);

    // Завантажуємо дані тренувань юзера
    const data = localStorage.getItem(`fitlog_saved_exercises_${name}`);
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
    setLoginEmail('');
    setLoginPassword('');
    setAuthView('login');
  };

  // --- ЕКРАНИ АВТОРИЗАЦІЇ ---
  if (!currentUser) {
    return (
      <div className={styles.app}>
        <main className={styles.main} style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className={styles.card} style={{ width: '100%', maxWidth: '400px' }}>
            
            {/* 1. ЕКРАН ВХОДУ */}
            {authView === 'login' && (
              <div>
                <h2 className={styles.title} style={{ textAlign: 'center', marginBottom: '8px' }}>Вхід у FitLog</h2>
                <p style={{ fontSize: '13px', color: 'var(--text)', textAlign: 'center', marginBottom: '16px' }}>
                  Введіть пошту та пароль для доступу.
                </p>
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="email"
                    placeholder="Ваша пошта..."
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Ваш пароль..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                    required
                  />
                  {errorMsg && <span style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>{errorMsg}</span>}
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>
                    Увійти
                  </button>
                  <button type="button" onClick={() => { setAuthView('register-form'); setErrorMsg(''); }} style={{ background: 'transparent', color: 'var(--accent)', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}>
                    Немає акаунта? Зареєструватися →
                  </button>
                </form>
              </div>
            )}

            {/* 2. ЕКРАН ЗАПИТУ НА РЕЄСТРАЦІЮ (Введення імені та пошти) */}
            {authView === 'register-form' && (
              <div>
                <h2 className={styles.title} style={{ textAlign: 'center', marginBottom: '8px' }}>Реєстрація</h2>
                <p style={{ fontSize: '13px', color: 'var(--text)', textAlign: 'center', marginBottom: '16px' }}>
                  Введіть ім'я та пошту. Ми надішлемо вам лист із посиланням.
                </p>
                <form onSubmit={handleRegisterRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Ваше ім'я..."
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Ваша пошта..."
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                    required
                  />
                  {errorMsg && <span style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>{errorMsg}</span>}
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>
                    Продовжити
                  </button>
                  <button type="button" onClick={() => { setAuthView('login'); setErrorMsg(''); }} style={{ background: 'transparent', color: 'var(--text)', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}>
                    ← Повернутися до входу
                  </button>
                </form>
              </div>
            )}

            {/* 3. ПОВІДОМЛЕННЯ ПРО ВІДПРАВКУ ЛИСТА */}
            {authView === 'success-sent' && (
              <div style={{ textAlign: 'center' }}>
                <h2 className={styles.title} style={{ marginBottom: '12px' }}>Перевірте пошту</h2>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.5', marginBottom: '20px' }}>
                  {successMsg}
                </p>
                <button type="button" onClick={() => setAuthView('login')} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                  Перейти до входу
                </button>
              </div>
            )}

            {/* 4. ЕКРАН ВСТАНОВЛЕННЯ ПАРОЛЯ (Коли юзер "перейшов за посиланням з листа") */}
            {authView === 'set-password' && (
              <div>
                <h2 className={styles.title} style={{ textAlign: 'center', marginBottom: '8px' }}>Створення пароля</h2>
                <p style={{ fontSize: '13px', color: 'var(--text)', textAlign: 'center', marginBottom: '16px' }}>
                  Придумайте надійний пароль для завершення реєстрації.
                </p>
                <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="password"
                    placeholder="Новий пароль..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
                    required
                  />
                  {errorMsg && <span style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>{errorMsg}</span>}
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>
                    Завершити реєстрацію
                  </button>
                </form>
              </div>
            )}

          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- ОСНОВНИЙ ІНТЕРФЕЙС (для залогіненого юзера) ---
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