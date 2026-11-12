import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import type { ExerciseLogData, SetItem } from '../../types';
import styles from './ExerciseLogForm.module.scss';

interface ExerciseLogFormProps {
  onSave: (data: ExerciseLogData) => void;
}

// Базові популярні вправи для швидкого пошуку та підказок
const DEFAULT_EXERCISES = [
  'Жим лежачи',
  'Присідання зі штангою',
  'Станова тяга',
  'Жим гантелей сидячи',
  'Підтягування',
  'Віджимання на брусах',
  'Зігинання рук на біцепс',
  'Французький жим',
  'Тяга верхнього блоку',
  'Жим ногами в тренажері'
];

export const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({ onSave }) => {
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState<SetItem[]>([
    { id: '1', weight: '', reps: '' }
  ]);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Збираємо унікальні вправи (базові + ті, що користувач вже колись зберіг)
  const [allExercises, setAllExercises] = useState<string[]>(DEFAULT_EXERCISES);

  useEffect(() => {
    const user = localStorage.getItem('fitlog_current_user');
    if (!user) return;
    const savedLogs = localStorage.getItem(`fitlog_logs_${user}`);
    if (savedLogs) {
      const logs: ExerciseLogData[] = JSON.parse(savedLogs);
      const userExercises = logs.map(log => log.exerciseName);
      // Об'єднуємо дефолтні та збережені користувачем, прибираючи дублікати
      const combined = Array.from(new Set([...DEFAULT_EXERCISES, ...userExercises]));
      setAllExercises(combined);
    }
  }, []);

  // Закриття випадаючого списку при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Фільтрація варіантів на основі введеного тексту (реакція на кожну літеру)
  const filteredSuggestions = allExercises.filter(name =>
    name.toLowerCase().includes(exerciseName.toLowerCase())
  );

  const handleAddSet = () => {
    setSets([
      ...sets,
      { id: Date.now().toString(), weight: '', reps: '' }
    ]);
  };

  const handleSetChange = (id: string, field: 'weight' | 'reps', value: string) => {
    setSets(
      sets.map((set) =>
        set.id === id ? { ...set, [field]: value === '' ? '' : Number(value) } : set
      )
    );
  };

  const handleRemoveSet = (id: string) => {
    if (sets.length > 1) {
      setSets(sets.filter((set) => set.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    const formattedSets = sets.map(set => ({
      ...set,
      weight: set.weight === '' ? 0 : set.weight,
      reps: set.reps === '' ? 0 : set.reps,
    }));

    onSave({
      exerciseName,
      sets: formattedSets,
    });

    setExerciseName('');
    setSets([{ id: '1', weight: '', reps: '' }]);
    setIsDropdownOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.form__title}>Записати вправу</h2>

      {/* Поле введення з пошуком та інтерактивним автокомплітом */}
      <div className={styles.form__field}>
        <label htmlFor="exerciseName">Назва вправи</label>
        <div className={styles.form__inputWrapper} ref={wrapperRef} style={{ position: 'relative' }}>
          <Search size={18} />
          <input
            id="exerciseName"
            type="text"
            placeholder="Почніть вводити назву (напр. Жим)..."
            value={exerciseName}
            onChange={(e) => {
              setExerciseName(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            required
          />

          {/* Випадаючий список підказок, що фільтрується при введенні кожної літери */}
          {isDropdownOpen && filteredSuggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow)',
              listStyle: 'none',
              margin: 0,
              padding: '6px 0',
              zIndex: 50,
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {filteredSuggestions.map((name, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setExerciseName(name);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    color: 'var(--text-h)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.form__setsSection}>
        <div className={styles.form__setsHeader}>
          <span>Підхід</span>
          <div style={{ display: 'flex', gap: '54px' }}>
            <span>Вага (кг)</span>
            <span>Повторення</span>
          </div>
        </div>

        <div className={styles.form__setsList}>
          {sets.map((set, index) => (
            <div key={set.id} className={styles.form__setItem}>
              <span className={styles.form__setBadge}>#{index + 1}</span>

              <div className={styles.form__inputsGroup}>
                <input
                  type="number"
                  placeholder="0"
                  value={set.weight}
                  onChange={(e) => handleSetChange(set.id, 'weight', e.target.value)}
                  min="0"
                  step="0.5"
                />
                <input
                  type="number"
                  placeholder="0"
                  value={set.reps}
                  onChange={(e) => handleSetChange(set.id, 'reps', e.target.value)}
                  min="0"
                />
              </div>

              {sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSet(set.id)}
                  className={styles.form__removeBtn}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={handleAddSet} className={styles.form__addSetBtn}>
          <Plus size={16} /> Додати підхід
        </button>
      </div>

      <button type="submit" className={styles.form__submitBtn}>
        Зберегти результати вправи
      </button>
    </form>
  );
};

export default ExerciseLogForm;