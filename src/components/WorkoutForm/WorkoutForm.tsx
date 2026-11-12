import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import styles from './WorkoutForm.module.scss';

interface ExerciseItem {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

interface WorkoutFormProps {
  onSubmit: (workoutData: { title: string; description: string; exercises: ExerciseItem[] }) => void;
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    { id: '1', name: '', sets: '', reps: '' },
  ]);

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: '', reps: '' },
    ]);
  };

  const handleRemoveExercise = (id: string) => {
    if (exercises.length === 1) return; // Залишаємо хоча б одну вправу
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleExerciseChange = (id: string, field: keyof ExerciseItem, value: string) => {
    setExercises(
      exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, exercises });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.form__title}>Створити шаблон тренування</h2>

      <div className={styles.form__field}>
        <label htmlFor="title">Назва шаблону</label>
        <input
          id="title"
          type="text"
          placeholder="Наприклад: День ніг (Leg Day)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className={styles.form__field}>
        <label htmlFor="description">Опис (необов'язково)</label>
        <textarea
          id="description"
          rows={2}
          placeholder="Короткий опис акценту тренування..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.form__sectionTitle}>
        <span>Вправи</span>
        <button
          type="button"
          onClick={handleAddExercise}
          className={styles.form__addBtn}
        >
          <Plus className="w-4 h-4" /> Додати вправу
        </button>
      </div>

      {exercises.map((exercise, index) => (
        <div key={exercise.id} className={styles.form__exerciseCard}>
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder={`Вправа #${index + 1} (напр. Присідання)`}
              value={exercise.name}
              onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)}
              required
            />
          </div>
          <div className={styles.form__exerciseInputs}>
            <input
              type="text"
              placeholder="Підходи"
              value={exercise.sets}
              onChange={(e) => handleExerciseChange(exercise.id, 'sets', e.target.value)}
            />
            <input
              type="text"
              placeholder="Повторення"
              value={exercise.reps}
              onChange={(e) => handleExerciseChange(exercise.id, 'reps', e.target.value)}
            />
          </div>
          {exercises.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveExercise(exercise.id)}
              className={styles.form__removeBtn}
              title="Видалити вправу"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}

      <button type="submit" className={styles.form__submitBtn}>
        Зберегти шаблон
      </button>
    </form>
  );
};