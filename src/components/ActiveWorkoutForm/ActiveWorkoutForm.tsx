import React, { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import styles from './ActiveWorkoutForm.module.scss';

interface SetRecord {
  setNumber: number;
  weight: string;
  reps: string;
}

interface ExerciseProgress {
  id: string;
  name: string;
  sets: SetRecord[];
}

interface ActiveWorkoutProps {
  workoutTitle: string;
  workoutDescription?: string;
  initialExercises: { id: string; name: string }[];
  onFinishWorkout: (result: { title: string; exercises: ExerciseProgress[]; date: string }) => void;
}

export const ActiveWorkoutForm: React.FC<ActiveWorkoutProps> = ({
  workoutTitle,
  workoutDescription,
  initialExercises,
  onFinishWorkout,
}) => {
  const [exercises, setExercises] = useState<ExerciseProgress[]>(
    initialExercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      sets: [{ setNumber: 1, weight: '', reps: '' }],
    }))
  );

  const handleAddSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [
              ...ex.sets,
              { setNumber: ex.sets.length + 1, weight: '', reps: '' },
            ],
          };
        }
        return ex;
      })
    );
  };

  const handleSetChange = (
    exerciseId: string,
    setNumber: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((s) =>
              s.setNumber === setNumber ? { ...s, [field]: value } : s
            ),
          };
        }
        return ex;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFinishWorkout({
      title: workoutTitle,
      exercises,
      date: new Date().toLocaleDateString(),
    });
  };

  return (
    <form className={styles.activeWorkout} onSubmit={handleSubmit}>
      <h2 className={styles.activeWorkout__title}>Тренування: {workoutTitle}</h2>
      {workoutDescription && (
        <p className={styles.activeWorkout__desc}>{workoutDescription}</p>
      )}

      {exercises.map((exercise) => (
        <div key={exercise.id} className={styles.activeWorkout__exerciseCard}>
          <h3 className={styles.activeWorkout__exerciseName}>{exercise.name}</h3>

          <div className={styles.activeWorkout__setsHeader}>
            <span>Підхід</span>
            <span>Вага (кг)</span>
            <span>Повторення</span>
            <span></span>
          </div>

          {exercise.sets.map((set) => (
            <div key={set.setNumber} className={styles.activeWorkout__setRow}>
              <span>#{set.setNumber}</span>
              <input
                type="number"
                placeholder="0"
                value={set.weight}
                onChange={(e) =>
                  handleSetChange(exercise.id, set.setNumber, 'weight', e.target.value)
                }
              />
              <input
                type="number"
                placeholder="0"
                value={set.reps}
                onChange={(e) =>
                  handleSetChange(exercise.id, set.setNumber, 'reps', e.target.value)
                }
              />
              <span></span>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddSet(exercise.id)}
            className={styles.activeWorkout__addBtn}
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Додати підхід
          </button>
        </div>
      ))}

      <button type="submit" className={styles.activeWorkout__finishBtn}>
        <CheckCircle className="w-5 h-5 inline mr-2" /> Завершити тренування
      </button>
    </form>
  );
};