import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User as UserIcon } from 'lucide-react';
import styles from './Header.module.scss';

interface HeaderProps {
  isAuthenticated: boolean;
  userEmail?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  userEmail,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закриваємо меню при кліку за його межами
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Отримуємо першу літеру пошти для аватара (наприклад, 'k')
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  return (
    <header className={styles.header}>
      <div className={styles.header__container}>
        <div className={styles.header__inner}>
          
          {/* Логотип */}
          <Link to="/" className={styles.header__logo}>
            <div className={styles.header__logoIcon}>
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className={styles.header__logoText}>
              Fit<span>Log</span>
            </span>
          </Link>

          {/* Навігація */}
          {isAuthenticated && (
            <nav className={styles.header__nav}>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${styles.header__link} ${isActive ? styles.active : ''}`
                }
              >
                Додати вправу
              </NavLink>
              
              <NavLink
                to="/saved"
                className={({ isActive }) =>
                  `${styles.header__link} ${isActive ? styles.active : ''}`
                }
              >
                Мої збережені вправи
              </NavLink>

              <NavLink
                to="/progress"
                className={({ isActive }) =>
                  `${styles.header__link} ${isActive ? styles.active : ''}`
                }
              >
                Прогрес
              </NavLink>
            </nav>
          )}

          {/* Блок користувача / Кнопка входу */}
          <div className={styles.header__actions}>
            {isAuthenticated ? (
              <div className={styles.profileContainer} ref={dropdownRef}>
                {/* Кругла кнопка-аватар */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={styles.avatarBtn}
                  title={userEmail}
                >
                  {userInitial}
                </button>

                {/* Випадаюче меню */}
                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <UserIcon className={styles.dropdownUserIcon} />
                      <span className={styles.dropdownEmail} title={userEmail}>
                        {userEmail}
                      </span>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className={styles.dropdownLogoutBtn}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Вийти</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className={styles.header__loginBtn}>
                Увійти
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};