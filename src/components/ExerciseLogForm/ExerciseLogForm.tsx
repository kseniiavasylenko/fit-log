import React, { useState } from 'react';
import styles from './ExerciseLogForm.module.scss';

interface ExerciseLogFormProps {
  category: string;
  exerciseName: string;
  onSave: (data: { category: string; exerciseName: string; date: string; sets: { weight: number; reps: number }[] }) => void;
  onBack: () => void;
}

export const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({ category, exerciseName, onSave, onBack }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sets, setSets] = useState<{ weight: number | ''; reps: number | '' }[]>([
    { weight: '', reps: '' }
  ]);

  const handleAddSet = () => {
    setSets([...sets, { weight: '', reps: '' }]);
  };

  const handleSetChange = (index: number, field: 'weight' | 'reps', value: number | '') => {
    const updated = [...sets];
    updated[index][field] = value;
    setSets(updated);
  };

  const handleRemoveSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedSets = sets
      .filter(s => s.weight !== '' && s.reps !== '')
      .map(s => ({ weight: Number(s.weight), reps: Number(s.reps) }));

    if (formattedSets.length === 0) return;

    onSave({
      category,
      exerciseName,
      date,
      sets: formattedSets,
    });
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backBtn}>
          ← Назад
        </button>
        <h2 className={styles.title}>{exerciseName}</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Дата тренування</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.setsHeader}>
          <span>Підходи</span>
          <button type="button" onClick={handleAddSet} className={styles.addSetBtn}>
            + Додати підхід
          </button>
        </div>

        <div className={styles.setsList}>
          {sets.map((set, index) => (
            <div key={index} className={styles.setItem}>
              <span className={styles.setNumber}>#{index + 1}</span>
              <input
                type="number"
                placeholder="Вага (кг)"
                value={set.weight}
                onChange={(e) => handleSetChange(index, 'weight', e.target.value === '' ? '' : Number(e.target.value))}
                className={styles.setInput}
                min="0"
                step="0.5"
                required
              />
              <input
                type="number"
                placeholder="Повторення"
                value={set.reps}
                onChange={(e) => handleSetChange(index, 'reps', e.target.value === '' ? '' : Number(e.target.value))}
                className={styles.setInput}
                min="1"
                required
              />
              {sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSet(index)}
                  className={styles.removeSetBtn}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="submit" className={styles.submitBtn}>
          Зберегти тренування
        </button>
      </form>
    </div>
  );
};