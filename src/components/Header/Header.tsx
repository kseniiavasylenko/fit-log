import React, { useState, useRef, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';
import styles from './Header.module.scss';

interface HeaderProps {
  currentUser: string;
  activeTab: 'add' | 'saved' | 'progress';
  setActiveTab: (tab: 'add' | 'saved' | 'progress') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, activeTab, setActiveTab, onLogout }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = currentUser.charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      {/* Логотип */}
      <div className={styles.header__logo} onClick={() => setActiveTab('add')}>
        <div className={styles.header__logoIcon}>
          <Dumbbell size={20} />
        </div>
        <h1 className={styles.header__title}>
          <span>Fit</span><span>Log</span>
        </h1>
      </div>

      {/* Навігація */}
      <nav className={styles.header__nav}>
        <button
          onClick={() => setActiveTab('add')}
          className={`${styles.header__navBtn} ${activeTab === 'add' ? styles['header__navBtn--active'] : ''}`}
        >
          Додати вправу
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`${styles.header__navBtn} ${activeTab === 'saved' ? styles['header__navBtn--active'] : ''}`}
        >
          Мої збережені вправи
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`${styles.header__navBtn} ${activeTab === 'progress' ? styles['header__navBtn--active'] : ''}`}
        >
          Прогрес
        </button>
      </nav>

      {/* Профіль / Аватарка */}
      <div className={styles.header__profile} ref={menuRef}>
        <div
          className={styles.header__avatar}
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          title={currentUser}
        >
          {userInitial}
          <span className={styles.header__avatarIndicator} />
        </div>

        {isProfileMenuOpen && (
          <div className={styles.header__dropdown}>
            <div className={styles.header__userInfo}>
              <span>Авторизовано як</span>
              <p>{currentUser}</p>
            </div>
            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                onLogout();
              }}
              className={styles.header__logoutBtn}
            >
              Вийти з акаунта
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;