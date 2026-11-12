import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer'; // <- Імпортуємо футер
import styles from './Layout.module.scss';

interface LayoutProps {
  isAuthenticated: boolean;
  userEmail?: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  isAuthenticated,
  userEmail,
  onLogout,
}) => {
  return (
    <div className={styles.layout}>
      {/* Шапка сайту */}
      <Header
        isAuthenticated={isAuthenticated}
        userEmail={userEmail}
        onLogout={onLogout}
      />

      {/* Головний контент сторінок */}
      <main className={styles.layout__main}>
        <Outlet />
      </main>

      {/* Підвал сайту */}
      <Footer />
    </div>
  );
};