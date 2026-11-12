import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import styles from './ExerciseLogForm.module.scss';

interface SetItem {
  id: string;
  weight: string;
  reps: string;
}

interface ExerciseLogData {
  exerciseName: string;
  sets: SetItem[];
}

interface ExerciseLogFormProps {
  onSave: (data: ExerciseLogData) => void;
}

// Наша база вправ для підказок
const EXERCISE_DATABASE = [
  'Жим штанги лежачи',
  'Жим гантелей на похилій лаві',
  'Присідання зі штангою',
  'Жим ногами в тренажері',
  'Тяга верхнього блоку',
  'Тяга штанги в нахилі',
  'Підйом штанги на біцепс',
  'Французький жим зі штангою лежачи',
  'Зігнуті розгинання рук на трицепс',
  'Махи гантелями в сторони',
  'Підтягування на перекладині',
  'Гіперекстензія',
  'Підйом на носки стоячи (литки)',
  'Скручування на прес',
];

export const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({ onSave }) => {
  const [exerciseName, setExerciseName] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sets, setSets] = useState<SetItem[]>([
    { id: '1', weight: '', reps: '' },
  ]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Закриваємо випадаючий список при кліку за межами форми
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExerciseName(value);

    if (value.trim().length > 0) {
      const matches = EXERCISE_DATABASE.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (name: string) => {
    setExerciseName(name);
    setShowSuggestions(false);
  };

  const handleAddSet = () => {
    setSets([
      ...sets,
      { id: Date.now().toString(), weight: '', reps: '' },
    ]);
  };

  const handleRemoveSet = (id: string) => {
    if (sets.length === 1) return;
    setSets(sets.filter((set) => set.id !== id));
  };

  const handleSetChange = (id: string, field: 'weight' | 'reps', value: string) => {
    setSets(
      sets.map((set) => (set.id === id ? { ...set, [field]: value } : set))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ exerciseName, sets });
    setExerciseName('');
    setSets([{ id: '1', weight: '', reps: '' }]);
  };

  return (
    <form className={styles.exerciseLog} onSubmit={handleSubmit}>
      <h2 className={styles.exerciseLog__title}>Записати вправу</h2>

      {/* Поле введення назви у стилі Google Search */}
      <div className={styles.exerciseLog__field} ref={wrapperRef}>
        <label htmlFor="exerciseName">Назва вправи</label>
        
        <div className={styles.exerciseLog__searchBox}>
          <div
            className={`${styles.exerciseLog__inputWrapper} ${
              showSuggestions && filteredSuggestions.length > 0
                ? styles.exerciseLog__inputWrapper_expanded
                : ''
            }`}
          >
            <Search className={styles.exerciseLog__searchIcon} />
            <input
              id="exerciseName"
              type="text"
              autoComplete="off"
              placeholder="Почніть вводити назву (напр. Жим)..."
              value={exerciseName}
              onChange={handleNameChange}
              onFocus={() => {
                if (exerciseName.trim().length > 0) setShowSuggestions(true);
              }}
              required
            />
            {exerciseName && (
              <button
                type="button"
                onClick={() => {
                  setExerciseName('');
                  setFilteredSuggestions([]);
                  setShowSuggestions(false);
                }}
                className={styles.exerciseLog__clearBtn}
                title="Очистити"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Випадаючий список підказок */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className={styles.exerciseLog__suggestions}>
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <Search />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.exerciseLog__setsSection}>
        <div className={styles.exerciseLog__setsHeader}>
          <span>Підхід</span>
          <span>Вага (кг)</span>
          <span>Повторення</span>
          <span></span>
        </div>

        {sets.map((set, index) => (
          <div key={set.id} className={styles.exerciseLog__setRow}>
            <span>#{index + 1}</span>
            <input
              type="number"
              step="0.5"
              placeholder="0"
              value={set.weight}
              onChange={(e) => handleSetChange(set.id, 'weight', e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="0"
              value={set.reps}
              onChange={(e) => handleSetChange(set.id, 'reps', e.target.value)}
              required
            />
            {sets.length > 1 ? (
              <button
                type="button"
                onClick={() => handleRemoveSet(set.id)}
                className={styles.exerciseLog__removeSetBtn}
                title="Видалити підхід"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <span></span>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddSet}
          className={styles.exerciseLog__addSetBtn}
        >
          <Plus className="w-4 h-4" /> Додати підхід
        </button>
      </div>

      <button type="submit" className={styles.exerciseLog__submitBtn}>
        Зберегти результати вправи
      </button>
    </form>
  );
};