import React, { useState } from 'react';
import { Dumbbell, Calendar, Trash2, Search } from 'lucide-react';
import styles from './SavedExercisesPage.module.scss';

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

interface SavedExercisesPageProps {
  logs: SavedExerciseLog[];
  onDelete: (id: string) => void;
}

export const SavedExercisesPage: React.FC<SavedExercisesPageProps> = ({ logs, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) =>
    log.exerciseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Заголовок та лічильник */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>
            <Dumbbell className={styles.titleIcon} /> Мої збережені вправи
          </h2>
          <p className={styles.subtitle}>Історія твоїх тренувань та підходів у залі</p>
        </div>
        <span className={styles.counter}>
          Всього записів: {logs.length}
        </span>
      </div>

      {/* Пошук вправ */}
      {logs.length > 0 && (
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Шукати вправу (напр. Жим, Присідання)..."
            className={styles.searchInput}
          />
        </div>
      )}

      {/* Вміст сторінки */}
      {logs.length === 0 ? (
        <div className={styles.emptyCard}>
          <Dumbbell className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Ви ще не зберегли жодної вправи.</p>
          <p className={styles.emptySubtitle}>Перейдіть на вкладку «Додати вправу», щоб зафіксувати свої результати.</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className={styles.emptyCard}>
          <p className={styles.emptyTitle}>За запитом «{searchQuery}» нічого не знайдено.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredLogs.map((log) => (
            <div key={log.id} className={styles.card}>
              <div className={styles.cardContent}>
                {log.photoUrl && (
                  <img 
                    src={log.photoUrl} 
                    alt={log.exerciseName} 
                    className={styles.exerciseImage} 
                  />
                )}
                <div className={styles.exerciseDetails}>
                  <div className={styles.exerciseHeader}>
                    <h3 className={styles.exerciseName}>{log.exerciseName}</h3>
                    <span className={styles.dateBadge}>
                      <Calendar className={styles.calendarIcon} /> {log.date}
                    </span>
                  </div>

                  {/* Список підходів */}
                  <div className={styles.setsList}>
                    {log.sets.map((set, idx) => (
                      <span key={set.id || idx} className={styles.setItem}>
                        <strong className={styles.setNum}>#{idx + 1}:</strong> {set.weight || 0} кг × {set.reps || 0} пов.
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDelete(log.id)}
                className={styles.deleteBtn}
                title="Видалити запис"
              >
                <Trash2 className={styles.trashIcon} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};