import React, { useState } from 'react';
import { Plus, Trash2, Dumbbell, Calendar, X } from 'lucide-react';
import { EXERCISES_BY_CATEGORY } from '../../types';
import styles from './CategoryExerciseSelector.module.scss';

interface Props {
  onSave: (data: { category: string; exerciseName: string; date: string; sets: { weight: number; reps: number }[] }) => void;
}

const normalizeName = (name: string): string => {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const CategoryExerciseSelector: React.FC<Props> = ({ onSave }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('Руки');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [exerciseDate, setExerciseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [customExercises, setCustomExercises] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('fitlog_custom_exercises');
    return saved ? JSON.parse(saved) : {};
  });

  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [newCustomName, setNewCustomName] = useState<string>('');

  const [sets, setSets] = useState<{ id: string; weight: number | ''; reps: number | '' }[]>([
    { id: '1', weight: '', reps: '' }
  ]);

  const categories = Object.keys(EXERCISES_BY_CATEGORY);
  const defaultExercises = EXERCISES_BY_CATEGORY[selectedGroup] || [];
  const categoryCustoms = customExercises[selectedGroup] || [];

  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedNewName = normalizeName(newCustomName);
    if (!normalizedNewName) return;

    const allExisting = [...defaultExercises, ...categoryCustoms];
    const existingMatch = allExisting.find(
      ex => ex.toLowerCase() === normalizedNewName.toLowerCase()
    );

    if (existingMatch) {
      setSelectedExercise(existingMatch);
      setNewCustomName('');
      setIsAddingCustom(false);
      return;
    }

    const updatedCustoms = {
      ...customExercises,
      [selectedGroup]: [...categoryCustoms, normalizedNewName]
    };

    setCustomExercises(updatedCustoms);
    localStorage.setItem('fitlog_custom_exercises', JSON.stringify(updatedCustoms));

    setSelectedExercise(normalizedNewName);
    setNewCustomName('');
    setIsAddingCustom(false);
  };

  // Функція видалення власної вправи
  const handleDeleteCustomExercise = (exName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // щоб не обирати вправу при кліку на видалення
    const updatedCategoryCustoms = categoryCustoms.filter(ex => ex !== exName);
    const updatedCustoms = {
      ...customExercises,
      [selectedGroup]: updatedCategoryCustoms
    };

    setCustomExercises(updatedCustoms);
    localStorage.setItem('fitlog_custom_exercises', JSON.stringify(updatedCustoms));

    if (selectedExercise === exName) {
      setSelectedExercise('');
    }
  };

  const handleAddSet = () => {
    setSets([...sets, { id: Date.now().toString(), weight: '', reps: '' }]);
  };

  const handleSetChange = (id: string, field: 'weight' | 'reps', value: string) => {
    setSets(sets.map(s => s.id === id ? { ...s, [field]: value === '' ? '' : Number(value) } : s));
  };

  const handleRemoveSet = (id: string) => {
    if (sets.length > 1) {
      setSets(sets.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;

    const formattedSets = sets.map(s => ({
      weight: s.weight === '' ? 0 : s.weight,
      reps: s.reps === '' ? 0 : s.reps,
    }));

    onSave({
      category: selectedGroup,
      exerciseName: selectedExercise,
      date: exerciseDate,
      sets: formattedSets
    });

    setSelectedExercise('');
    setSets([{ id: '1', weight: '', reps: '' }]);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.form__title}>Вибір вправи за категорією</h2>

      {/* Дата виконання */}
      <div className={styles.form__field}>
        <label>Дата виконання</label>
        <div className={styles.form__inputWrapper}>
          <Calendar size={18} />
          <input 
            type="date" 
            value={exerciseDate} 
            onChange={(e) => setExerciseDate(e.target.value)} 
            required 
          />
        </div>
      </div>

      {/* Категорії м'язів */}
      <div className={styles.form__field}>
        <label>Категорія м'язів</label>
        <div className={styles.form__categories}>
          {categories.map(cat => (
            <button
              type="button"
              key={cat}
              className={`${styles.form__catBtn} ${selectedGroup === cat ? styles['form__catBtn--active'] : ''}`}
              onClick={() => {
                setSelectedGroup(cat);
                setSelectedExercise('');
                setIsAddingCustom(false);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Список вправ */}
      <div className={styles.form__field}>
        <label>Оберіть вправу</label>
        <div className={styles.form__exerciseGrid}>
          {/* Дефолтні вправи */}
          {defaultExercises.map(ex => (
            <button
              type="button"
              key={ex}
              className={`${styles.form__exCard} ${selectedExercise === ex ? styles['form__exCard--active'] : ''}`}
              onClick={() => {
                setSelectedExercise(ex);
                setIsAddingCustom(false);
              }}
            >
              <Dumbbell size={16} />
              <span>{ex}</span>
            </button>
          ))}

          {/* Кастомні вправи */}
          {categoryCustoms.map(ex => (
            <button
              type="button"
              key={ex}
              className={`${styles.form__exCard} ${selectedExercise === ex ? styles['form__exCard--active'] : ''}`}
              onClick={() => {
                setSelectedExercise(ex);
                setIsAddingCustom(false);
              }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <Dumbbell size={16} style={{ flexShrink: 0 }} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ex}</span>
              </div>
              <span 
                title="Видалити вправу"
                onClick={(e) => handleDeleteCustomExercise(ex, e)}
                style={{ padding: '2px', color: '#ef4444', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </span>
            </button>
          ))}

          {/* Кнопка додавання своєї вправи (виправлено: без зайвого плюса) */}
          <button
            type="button"
            className={`${styles.form__exCard} ${styles['form__exCard--add']}`}
            onClick={() => setIsAddingCustom(true)}
          >
            <Plus size={16} />
            <span>Своя вправа</span>
          </button>
        </div>

        {/* Інпут для введення нової вправи */}
        {isAddingCustom && (
          <div className={styles.form__customInputBox} style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Введіть назву нової вправи..."
              value={newCustomName}
              onChange={(e) => setNewCustomName(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                background: 'var(--bg)',
                border: '1px solid var(--accent)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-h)',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomExercise}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Додати
            </button>
          </div>
        )}
      </div>

      {/* Підходи та вага */}
      {selectedExercise && (
        <div className={styles.form__setsSection}>
          <h3>Обрана вправа: <span style={{ color: 'var(--accent)' }}>{selectedExercise}</span></h3>
          
          <div className={styles.form__setsList}>
            {sets.map((set, idx) => (
              <div key={set.id} className={styles.form__setItem}>
                <span>#{idx + 1}</span>
                <input
                  type="number"
                  placeholder="Вага (кг)"
                  value={set.weight}
                  onChange={(e) => handleSetChange(set.id, 'weight', e.target.value)}
                  min="0"
                  step="0.5"
                />
                <input
                  type="number"
                  placeholder="Повторення"
                  value={set.reps}
                  onChange={(e) => handleSetChange(set.id, 'reps', e.target.value)}
                  min="0"
                />
                {sets.length > 1 && (
                  <button type="button" onClick={() => handleRemoveSet(set.id)} className={styles.form__removeBtn}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddSet} className={styles.form__addSetBtn}>
            <Plus size={16} /> Додати підхід
          </button>

          <button type="submit" className={styles.form__submitBtn}>
            Зберегти в історію тренувань
          </button>
        </div>
      )}
    </form>
  );
};

export default CategoryExerciseSelector;