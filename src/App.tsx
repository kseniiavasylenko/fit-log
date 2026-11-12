import { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage/AuthPage';
import { ExerciseLogForm } from './components/ExerciseLogForm/ExerciseLogForm';
import { Footer } from './components/Footer/Footer';
import type { ExerciseLogData } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('fitlog_current_user');
  });

  // Лінива ініціалізація стейту — читаємо з localStorage один раз при запуску
  const [logs, setLogs] = useState<ExerciseLogData[]>(() => {
    const user = localStorage.getItem('fitlog_current_user');
    if (!user) return [];
    const savedLogs = localStorage.getItem(`fitlog_logs_${user}`);
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  // Синхронізуємо зміни у сховищі, коли логи оновлюються
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`fitlog_logs_${currentUser}`, JSON.stringify(logs));
    }
  }, [logs, currentUser]);

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('fitlog_current_user', email);
    setCurrentUser(email);
    // Завантажуємо логи для нового користувача
    const savedLogs = localStorage.getItem(`fitlog_logs_${email}`);
    setLogs(savedLogs ? JSON.parse(savedLogs) : []);
  };

  const handleLogout = () => {
    localStorage.removeItem('fitlog_current_user');
    setCurrentUser(null);
    setLogs([]);
  };

  const handleFormSave = (data: ExerciseLogData) => {
    const updatedLogs = [data, ...logs];
    setLogs(updatedLogs);
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight text-indigo-400">FitLog</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{currentUser}</span>
          <button
            onClick={handleLogout}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Вийти
          </button>
        </div>
      </header>

      <main className="max-w-xl w-full mx-auto p-4 flex-1 my-6">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Записати вправу</h2>
          <ExerciseLogForm onSave={handleFormSave} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Історія тренувань</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Ще немає записаних вправ. Додай першу вище!</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-indigo-300 mb-2">{log.exerciseName}</h3>
                <div className="space-y-1">
                  {log.sets.map((set, sIdx) => (
                    <div key={sIdx} className="text-sm text-slate-400 flex justify-between">
                      <span>Підхід {sIdx + 1}</span>
                      <span>{set.weight} кг × {set.reps} повт.</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;