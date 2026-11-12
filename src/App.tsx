import { useState, useEffect, useRef } from 'react';
import { AuthPage } from './pages/AuthPage/AuthPage';
import { ExerciseLogForm } from './components/ExerciseLogForm/ExerciseLogForm';
import { Footer } from './components/Footer/Footer';
import { Dumbbell } from 'lucide-react'; // Використовуємо іконку з бібліотеки
import type { ExerciseLogData } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('fitlog_current_user');
  });

  const [activeTab, setActiveTab] = useState<'add' | 'saved' | 'progress'>('add');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<ExerciseLogData[]>(() => {
    const user = localStorage.getItem('fitlog_current_user');
    if (!user) return [];
    const savedLogs = localStorage.getItem(`fitlog_logs_${user}`);
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`fitlog_logs_${currentUser}`, JSON.stringify(logs));
    }
  }, [logs, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('fitlog_current_user', email);
    setCurrentUser(email);
    const savedLogs = localStorage.getItem(`fitlog_logs_${email}`);
    setLogs(savedLogs ? JSON.parse(savedLogs) : []);
  };

  const handleLogout = () => {
    localStorage.removeItem('fitlog_current_user');
    setCurrentUser(null);
    setLogs([]);
    setIsProfileMenuOpen(false);
  };

  const handleFormSave = (data: ExerciseLogData) => {
    const updatedLogs = [data, ...logs];
    setLogs(updatedLogs);
    setActiveTab('saved');
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const userInitial = currentUser.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Шапка */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Логотип з іконкою та навігація */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div 
            onClick={() => setActiveTab('add')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              userSelect: 'none' 
            }}
          >
            {/* Блок іконки як на скріншоті */}
            <div style={{
              background: 'var(--accent)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 'var(--shadow)'
            }}>
              <Dumbbell size={20} />
            </div>
            {/* Текст FitLog із кольоровим акцентом на Log */}
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-h)', margin: 0, display: 'flex' }}>
              <span>Fit</span><span style={{ color: 'var(--accent)' }}>Log</span>
            </h1>
          </div>

          {/* Навігація */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('add')}
              style={{
                background: activeTab === 'add' ? 'var(--code-bg)' : 'transparent',
                border: activeTab === 'add' ? '1px solid var(--border)' : 'none',
                color: activeTab === 'add' ? 'var(--text-h)' : 'var(--text)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Додати вправу
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              style={{
                background: activeTab === 'saved' ? 'var(--code-bg)' : 'transparent',
                border: activeTab === 'saved' ? '1px solid var(--border)' : 'none',
                color: activeTab === 'saved' ? 'var(--text-h)' : 'var(--text)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Мої збережені вправи
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              style={{
                background: activeTab === 'progress' ? 'var(--code-bg)' : 'transparent',
                border: activeTab === 'progress' ? '1px solid var(--border)' : 'none',
                color: activeTab === 'progress' ? 'var(--text-h)' : 'var(--text)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Прогрес
            </button>
          </nav>
        </div>

        {/* Аватарка-кружечок справа з попапом виходу */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow)',
              position: 'relative',
              userSelect: 'none'
            }}
            title={currentUser}
          >
            {userInitial}
            <span style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '10px',
              height: '10px',
              background: '#10b981',
              borderRadius: '50%',
              border: '2px solid var(--bg)'
            }} />
          </div>

          {isProfileMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: 'var(--shadow)',
              minWidth: '220px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text)' }}>Авторизовано як</span>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-h)', margin: '2px 0 0 0', wordBreak: 'break-all' }}>
                  {currentUser}
                </p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  textAlign: 'center'
                }}
              >
                Вийти з акаунта
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Головний контент */}
      <main style={{
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        padding: '32px 16px',
        flex: 1,
        boxSizing: 'border-box'
      }}>
        {activeTab === 'add' && (
          <div style={{
            background: 'var(--code-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow)'
          }}>
            <ExerciseLogForm onSave={handleFormSave} />
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '20px', color: 'var(--text-h)' }}>Мої збережені вправи</h2>
            {logs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text)', padding: '32px 0', fontSize: '15px' }}>
                Ще немає збережених вправ. Додай першу через вкладку «Додати вправу»!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {logs.map((log, index) => (
                  <div key={index} style={{
                    background: 'var(--code-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '16px'
                  }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--text-h)', marginBottom: '8px' }}>{log.exerciseName}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {log.sets.map((set, sIdx) => (
                        <div key={sIdx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                          color: 'var(--text)',
                          background: 'var(--bg)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)'
                        }}>
                          <span>Підхід {sIdx + 1}</span>
                          <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>{set.weight} кг × {set.reps} повт.</span>
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
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '20px', color: 'var(--text-h)' }}>Прогрес тренувань</h2>
            <div style={{
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <p style={{ fontSize: '15px', color: 'var(--text)', margin: 0, textAlign: 'center' }}>
                {logs.length === 0 
                  ? 'Додай перші тренування, щоб побачити аналітику свого прогресу!' 
                  : 'Тут відображатиметься динаміка твоїх результатів та ваг по вправах.'}
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;