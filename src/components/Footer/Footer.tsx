import React from 'react';
import { Dumbbell, Heart } from 'lucide-react';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footer__container}>
        <div className={styles.footer__content}>
          <div className={styles.footer__brand}>
            <div className={styles.footer__logoIcon}>
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className={styles.footer__logoText}>
              Fit<span>Log</span>
            </span>
          </div>

          <div className={styles.footer__copy}>
            <span>© {currentYear} FitLog. Зроблено з</span>
            <Heart className={styles.footer__heart} />
            <span>для досягнення цілей.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};