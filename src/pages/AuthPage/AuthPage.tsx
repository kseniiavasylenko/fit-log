import React, { useState } from 'react';
import styles from './AuthPage.module.scss';

interface AuthPageProps {
  onLoginSuccess: (email: string) => void;
}

interface UserAccount {
  email: string;
  password: string;
  name?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Отримуємо існуючих користувачів із localStorage
    const savedUsers: UserAccount[] = JSON.parse(localStorage.getItem('fitlog_users') || '[]');

    if (isRegisterMode) {
      // Реєстрація нового користувача
      const userExists = savedUsers.some((user) => user.email === email);
      if (userExists) {
        setError('Користувач із такою поштою вже зареєстрований!');
        return;
      }

      const newUser: UserAccount = { email, password, name };
      savedUsers.push(newUser);
      localStorage.setItem('fitlog_users', JSON.stringify(savedUsers));

      // Успішний вхід після реєстрації
      onLoginSuccess(email);
    } else {
      // Вхід існуючого користувача
      const foundUser = savedUsers.find(
        (user) => user.email === email && user.password === password
      );

      if (!foundUser) {
        setError('Невірний email або пароль, або акаунт не існує!');
        return;
      }

      // Успішний вхід
      onLoginSuccess(email);
    }
  };

  return (
    <div className={styles.auth}>
      <div className={styles.auth__card}>
        <h1 className={styles.auth__title}>
          {isRegisterMode ? 'Створити акаунт' : 'З поверненням!'}
        </h1>
        <p className={styles.auth__subtitle}>
          {isRegisterMode
            ? 'Зареєструйтеся, щоб відстежувати свої тренування'
            : 'Увійдіть у свій профіль FitLog'}
        </p>

        <div className={styles.auth__tabs}>
          <button
            type="button"
            className={`${styles.auth__tab} ${!isRegisterMode ? styles.auth__tab_active : ''}`}
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
            }}
          >
            Вхід
          </button>
          <button
            type="button"
            className={`${styles.auth__tab} ${isRegisterMode ? styles.auth__tab_active : ''}`}
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
            }}
          >
            Реєстрація
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form className={styles.auth__form} onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className={styles.auth__field}>
              <label htmlFor="name">Ім'я</label>
              <input
                id="name"
                type="text"
                placeholder="Ваше ім'я"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegisterMode}
              />
            </div>
          )}

          <div className={styles.auth__field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.auth__field}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.auth__submitBtn}>
            {isRegisterMode ? 'Зареєструватися' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
};