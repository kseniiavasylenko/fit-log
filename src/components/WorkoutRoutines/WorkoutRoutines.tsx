import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Dumbbell, Play, X, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import { EXERCISES_BY_CATEGORY } from '../../types';
import styles from './WorkoutRoutines.module.scss';

interface RoutineExercise {
  category: string;
  exerciseName: string;
}

interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

interface Props {
  currentUser: string;
  onFinishRoutineWorkout: (routineName: string, durationSeconds: number, loggedExercises: { category: string; exerciseName: string; date: string; sets: { weight: number; reps: number }[] }[]) => void;
}

export const WorkoutRoutines: React.FC<Props> = ({ currentUser, onFinishRoutineWorkout }) => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    const saved = localStorage.getItem(`fitlog_routines_${currentUser}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Руки');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [customExerciseInput, setCustomExerciseInput] = useState('');

  const [activeWorkoutSession, setActiveWorkoutSession] = useState<{
    routine: WorkoutRoutine;
    exerciseLogs: { [index: number]: { weight: string; reps: string }[] };
    expandedIndex: number | null;
    secondsElapsed: number;
  } | null>(null);

  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeWorkoutSession) {
      timer = setInterval(() => {
        setActiveWorkoutSession(prev => prev ? { ...prev, secondsElapsed: prev.secondsElapsed + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeWorkoutSession !== null]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} сек`;
    return `${mins} хв ${secs > 0 ? `${secs} сек` : ''}`;
  };

  const categories = Object.keys(EXERCISES_BY_CATEGORY);
  const availableExercises = EXERCISES_BY_CATEGORY[selectedCategory] || [];

  const handleAddExerciseToRoutine = (exerciseName: string) => {
    if (!exerciseName.trim()) return;
    const formattedName = exerciseName.trim();
    if (routineExercises.some(ex => ex.exerciseName.toLowerCase() === formattedName.toLowerCase() && ex.category === selectedCategory)) {
      return;
    }
    setRoutineExercises([...routineExercises, { category: selectedCategory, exerciseName: formattedName }]);
  };

  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExerciseInput.trim()) return;
    handleAddExerciseToRoutine(customExerciseInput);
    setCustomExerciseInput('');
  };

  const handleRemoveExerciseFromRoutine = (index: number) => {
    setRoutineExercises(routineExercises.filter((_, i) => i !== index));
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineName.trim() || routineExercises.length === 0) return;

    const newRoutine: WorkoutRoutine = {
      id: Date.now().toString(),
      name: routineName.trim(),
      exercises: routineExercises,
    };

    const updated = [...routines, newRoutine];
    setRoutines(updated);
    localStorage.setItem(`fitlog_routines_${currentUser}`, JSON.stringify(updated));

    setRoutineName('');
    setRoutineExercises([]);
    setCustomExerciseInput('');
    setIsCreating(false);
  };

  const handleDeleteRoutine = (id: string) => {
    const updated = routines.filter(r => r.id !== id);
    setRoutines(updated);
    localStorage.setItem(`fitlog_routines_${currentUser}`, JSON.stringify(updated));
  };

  const handleStartRoutine = (routine: WorkoutRoutine) => {
    setActiveWorkoutSession({
      routine,
      exerciseLogs: {},
      expandedIndex: null,
      secondsElapsed: 0,
    });
  };

  const handleAddSetToSessionExercise = (index: number) => {
    const w = Number(weightInput);
    const r = Number(repsInput);
    if (isNaN(w) || isNaN(r) || w < 0 || r <= 0) return;

    const currentLogs = activeWorkoutSession?.exerciseLogs || {};
    const exerciseSets = currentLogs[index] || [];

    setActiveWorkoutSession({
      ...activeWorkoutSession!,
      exerciseLogs: {
        ...currentLogs,
        [index]: [...exerciseSets, { weight: weightInput, reps: repsInput }],
      },
    });

    setWeightInput('');
    setRepsInput('');
  };

  const handleRemoveSetFromSessionExercise = (exIndex: number, setIndex: number) => {
    const currentLogs = activeWorkoutSession?.exerciseLogs || {};
    const exerciseSets = currentLogs[exIndex] || [];
    const updatedSets = exerciseSets.filter((_, i) => i !== setIndex);

    setActiveWorkoutSession({
      ...activeWorkoutSession!,
      exerciseLogs: {
        ...currentLogs,
        [exIndex]: updatedSets,
      },
    });
  };

  const handleFinishSession = () => {
    if (!activeWorkoutSession) return;

    const today = new Date().toISOString().split('T')[0];
    const loggedExercisesToSave: { category: string; exerciseName: string; date: string; sets: { weight: number; reps: number }[] }[] = [];

    activeWorkoutSession.routine.exercises.forEach((ex, idx) => {
      const sets = activeWorkoutSession.exerciseLogs[idx];
      if (sets && sets.length > 0) {
        loggedExercisesToSave.push({
          category: ex.category,
          exerciseName: ex.exerciseName,
          date: today,
          sets: sets.map(s => ({ weight: Number(s.weight), reps: Number(s.reps) })),
        });
      }
    });

    // Передаємо точну назву програми (наприклад, "День спини") наверх у батьківський компонент
    onFinishRoutineWorkout(
      activeWorkoutSession.routine.name, 
      activeWorkoutSession.secondsElapsed, 
      loggedExercisesToSave
    );
    
    setActiveWorkoutSession(null);
  };

  if (activeWorkoutSession) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveWorkoutSession(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Назад до програм
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(var(--accent-rgb), 0.15)', border: '1px solid var(--accent)', padding: '4px 10px', borderRadius: '20px', color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
            <Clock size={14} />
            <span>{formatTime(activeWorkoutSession.secondsElapsed)}</span>
          </div>
        </div>

        <div className={styles.formCard}>
          <h2 style={{ fontSize: '18px', color: 'var(--text-h)', margin: '0 0 16px 0' }}>
            🏋️‍♂️ {activeWorkoutSession.routine.name}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeWorkoutSession.routine.exercises.map((ex, index) => {
              const sets = activeWorkoutSession.exerciseLogs[index] || [];
              const isExpanded = activeWorkoutSession.expandedIndex === index;

              return (
                <div key={index} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-h)', display: 'block' }}>
                        {index + 1}. {ex.exerciseName}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--accent)' }}>{ex.category} • Підходів: {sets.length}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveWorkoutSession({ ...activeWorkoutSession, expandedIndex: isExpanded ? null : index })}
                      style={{ background: isExpanded ? 'var(--accent)' : 'var(--code-bg)', color: isExpanded ? '#fff' : 'var(--text-h)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} /> {isExpanded ? 'Закрити' : 'Додати підхід'}
                    </button>
                  </div>

                  {sets.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                      {sets.map((set, sIdx) => (
                        <div key={sIdx} style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>#{sIdx + 1}: <b>{set.weight}кг</b> × <b>{set.reps}повт.</b></span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSetFromSessionExercise(index, sIdx)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex' }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Вага (кг)"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className={styles.input}
                        style={{ width: '90px' }}
                      />
                      <input
                        type="number"
                        placeholder="Повторення"
                        value={repsInput}
                        onChange={(e) => setRepsInput(e.target.value)}
                        className={styles.input}
                        style={{ width: '100px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSetToSessionExercise(index)}
                        style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Зберегти підхід
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleFinishSession}
            style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <CheckCircle size={18} /> Завершити тренування та зберегти в історію
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Мої програми тренувань</h2>
        {!isCreating && (
          <button type="button" onClick={() => setIsCreating(true)} className={styles.createBtn}>
            <Plus size={16} /> Створити програму
          </button>
        )}
      </div>

      {isCreating ? (
        <form onSubmit={handleSaveRoutine} className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>Нова програма тренування</h3>
            <button type="button" onClick={() => setIsCreating(false)} className={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>

          <div className={styles.field}>
            <label>Назва програми (напр. «День спини або день ніг»)</label>
            <input
              type="text"
              placeholder="Введіть назву..."
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label>Оберіть категорію м'язів для вправ</label>
            <div className={styles.categories}>
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  className={`${styles.catBtn} ${selectedCategory === cat ? styles.catBtnActive : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>Готові вправи з бази (натисніть, щоб додати)</label>
            <div className={styles.exerciseList}>
              {availableExercises.map(ex => {
                const isAdded = routineExercises.some(item => item.exerciseName === ex && item.category === selectedCategory);
                return (
                  <button
                    type="button"
                    key={ex}
                    onClick={() => handleAddExerciseToRoutine(ex)}
                    className={`${styles.exerciseChip} ${isAdded ? styles.exerciseChipAdded : ''}`}
                  >
                    <Dumbbell size={14} /> {ex} {isAdded && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.field}>
            <label>Або додайте свою власну вправу до категорії «{selectedCategory}»</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Введіть назву вправи..."
                value={customExerciseInput}
                onChange={(e) => setCustomExerciseInput(e.target.value)}
                className={styles.input}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddCustomExercise}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-h)', padding: '0 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Додати
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label>Вправи у цій програмі ({routineExercises.length})</label>
            {routineExercises.length === 0 ? (
              <p className={styles.emptyText}>Ще не додано жодної вправи</p>
            ) : (
              <div className={styles.selectedList}>
                {routineExercises.map((item, index) => (
                  <div key={index} className={styles.selectedItem}>
                    <div>
                      <span className={styles.selName}>{item.exerciseName}</span>
                      <span className={styles.selCat}>{item.category}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseFromRoutine(index)}
                      className={styles.removeChipBtn}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className={styles.submitBtn}>
            Зберегти програму
          </button>
        </form>
      ) : (
        <div className={styles.routinesGrid}>
          {routines.length === 0 ? (
            <p className={styles.emptyText}>У вас ще немає створених програм. Створіть першу!</p>
          ) : (
            routines.map(routine => (
              <div key={routine.id} className={styles.routineCard}>
                <div className={styles.routineInfo}>
                  <h3>{routine.name}</h3>
                  <span className={styles.exercisesCount}>Вправ: {routine.exercises.length}</span>
                  <ul className={styles.previewList}>
                    {routine.exercises.map((ex, idx) => (
                      <li key={idx}>• {ex.exerciseName} <span style={{ opacity: 0.6 }}>({ex.category})</span></li>
                    ))}
                  </ul>
                </div>
                <div className={styles.routineActions}>
                  <button
                    type="button"
                    onClick={() => handleStartRoutine(routine)}
                    className={styles.startBtn}
                  >
                    <Play size={16} /> Розпочати
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoutine(routine.id)}
                    className={styles.deleteRoutineBtn}
                    title="Видалити програму"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutRoutines;