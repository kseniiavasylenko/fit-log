import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Dumbbell, History, LogOut, User } from 'lucide-react';
import styles from './Layout.module.scss';

interface LayoutProps {
  isAuthenticated: boolean;
  userEmail: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  isAuthenticated,
  userEmail,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.layout}>
      {/* Шапка сайту */}
      <header className={styles.header}>
        <div className={styles.header__container}>
          <Link to="/" className={styles.header__logo}>
            <Dumbbell className="w-6 h-6 text-indigo-400" />
            <span>Workout Log</span>
          </Link>

          {isAuthenticated && (
            <nav className={styles.header__nav}>
              <Link to="/" className={styles.header__navLink}>
                <Dumbbell className="w-4 h-4" /> Шаблони
              </Link>
              <Link to="/history" className={styles.header__navLink}>
                <History className="w-4 h-4" /> Історія
              </Link>
            </nav>
          )}

          <div className={styles.header__actions}>
            {isAuthenticated ? (
              <div className={styles.header__userProfile}>
                <div className={styles.header__userInfo}>
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className={styles.header__email}>{userEmail}</span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    navigate('/auth');
                  }}
                  className={styles.header__logoutBtn}
                  title="Вийти"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className={styles.header__loginLink}>
                Увійти
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Основний контент сторінок */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};