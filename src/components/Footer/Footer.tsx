import React from 'react';
import { Dumbbell } from 'lucide-react';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__logo}>
        <div className={styles.footer__logoIcon}>
          <Dumbbell size={18} />
        </div>
        <span className={styles.footer__title}>
          <span>Fit</span><span>Log</span>
        </span>
      </div>

      <p className={styles.footer__text}>
        © 2026 FitLog. Зроблено з ❤️ для досягнення цілей.
      </p>
    </footer>
  );
};

export default Footer;