import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { AuthPage } from './pages/AuthPage/AuthPage';
import { ExerciseLogForm } from './components/ExerciseLogForm/ExerciseLogForm';
import { SavedExercisesPage } from './pages/SavedExercisesPage/SavedExercisesPage';
import { ProgressPage } from './pages/ProgressPage/ProgressPage';
import { CheckCircle2 } from 'lucide-react';

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

// 1. Сторінка «Додати вправу» (Головна)
const AddExercisePage: React.FC<{ onSave: (data: { exerciseName: string; photoUrl: string; sets: SetItem[] }) => void }> = ({ onSave }) => {
  const [successMessage, setSuccessMessage] = useState(false);

  const handleFormSave = (data: { exerciseName: string; photoUrl: string; sets: SetItem[] }) => {
    onSave(data);
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Вправу успішно збережено у «Мої збережені вправи»!</span>
        </div>
      )}
      <ExerciseLogForm onSave={handleFormSave} />
    </div>
  );
};

export function App() {
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    return localStorage.getItem('gym_is_auth') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('gym_user_email') || '';
  });

  // Загальний стейт для збережених вправ
  const [logs, setLogs] = useState<SavedExerciseLog[]>(() => {
    const saved = localStorage.getItem('gym_exercise_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gym_exercise_logs', JSON.stringify(logs));
  }, [logs]);

  const handleSaveExercise = (data: { exerciseName: string; photoUrl: string; sets: SetItem[] }) => {
    const newLog: SavedExerciseLog = {
      id: Date.now().toString(),
      ...data,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLogs([newLog, ...logs]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setIsAuth(true);
    localStorage.setItem('gym_is_auth', 'true');
    localStorage.setItem('gym_user_email', email);
  };

  const handleLogout = () => {
    setUserEmail('');
    setIsAuth(false);
    localStorage.removeItem('gym_is_auth');
    localStorage.removeItem('gym_user_email');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              isAuthenticated={isAuth}
              userEmail={userEmail}
              onLogout={handleLogout}
            />
          }
        >
          {/* Головний маршрут: Додати вправу */}
          <Route
            index
            element={isAuth ? <AddExercisePage onSave={handleSaveExercise} /> : <Navigate to="/auth" replace />}
          />
          {/* Маршрут: Мої збережені вправи */}
          <Route
            path="saved"
            element={isAuth ? <SavedExercisesPage logs={logs} onDelete={handleDeleteLog} /> : <Navigate to="/auth" replace />}
          />
          {/* Маршрут: Прогрес */}
          <Route
            path="progress"
            element={isAuth ? <ProgressPage logs={logs} /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="auth"
            element={
              !isAuth ? (
                <AuthPage onLoginSuccess={handleLoginSuccess} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;