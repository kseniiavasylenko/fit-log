import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, LogOut, User } from 'lucide-react';
import styles from './Header.module.scss';

interface HeaderProps {
  currentUser: string;
  activeTab: 'add' | 'saved' | 'progress';
  setActiveTab: (tab: 'add' | 'saved' | 'progress') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, activeTab, setActiveTab, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      {/* Логотип */}
      <div className={styles.logo}>
        <div className={styles.logo__icon}>
          <Dumbbell size={20} />
        </div>
        <span>FitLog</span>
      </div>

      {/* Навігація */}
      <nav className={styles.nav}>
        <button
          className={`${styles.navBtn} ${activeTab === 'add' ? styles['navBtn--active'] : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Додати вправу
        </button>
        <button
          className={`${styles.navBtn} ${activeTab === 'saved' ? styles['navBtn--active'] : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Історія<br />тренувань
        </button>
        <button
          className={`${styles.navBtn} ${activeTab === 'progress' ? styles['navBtn--active'] : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Прогрес
        </button>
      </nav>

      {/* Профіль та випадаюче меню (Завжди видиме на всіх екранах) */}
      <div className={styles.userSection}>
        <div className={styles.userWrapper} ref={menuRef}>
          <button 
            className={styles.userAvatar} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Профіль"
          >
            {currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
          </button>

          {isMenuOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownItemUser}>
                <User size={14} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser}</span>
              </div>
              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItemLogout} onClick={onLogout}>
                <LogOut size={14} />
                <span>Вийти</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;