import React, { useState } from 'react';
import { Plus, Dumbbell, Trash2 } from 'lucide-react';
import { WorkoutForm } from '../../components/WorkoutForm/WorkoutForm';
import styles from './DashboardPage.module.scss';

interface ExerciseItem {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  exercises: ExerciseItem[];
}

export const DashboardPage: React.FC = () => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([
    {
      id: '1',
      title: 'День ніг (Leg Day)',
      description: 'Інтенсивне тренування квадрицепсів та сідничних мʼязів.',
      exercises: [
        { id: 'e1', name: 'Присідання зі штангою', sets: '4', reps: '8-10' },
        { id: 'e2', name: 'Жим ногами в тренажері', sets: '3', reps: '12' },
      ],
    },
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkout = (data: {
    title: string;
    description: string;
    exercises: ExerciseItem[];
  }) => {
    const newTemplate: WorkoutTemplate = {
      id: Date.now().toString(),
      ...data,
    };
    setTemplates([newTemplate, ...templates]);
    setIsCreating(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard__header}>
        <h1 className={styles.dashboard__title}>Шаблони тренувань</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className={styles.dashboard__createBtn}
          >
            <Plus className="w-4 h-4" /> Створити шаблон
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="max-w-2xl mx-auto w-full">
          <div className="mb-4 flex justify-between items-center">
            <span className="text-slate-400 text-sm">Новий шаблон</span>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer bg-transparent border-none"
            >
              Скасувати
            </button>
          </div>
          <WorkoutForm onSubmit={handleCreateWorkout} />
        </div>
      ) : (
        <>
          {templates.length === 0 ? (
            <div className={styles.dashboard__empty}>
              <Dumbbell className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-medium">У вас ще немає шаблонів тренувань</p>
              <p className="text-sm text-slate-500 mt-1">
                Створіть свій перший шаблон, щоб розпочати тренування
              </p>
            </div>
          ) : (
            <div className={styles.dashboard__grid}>
              {templates.map((template) => (
                <div key={template.id} className={styles.dashboard__card}>
                  <div>
                    <h3 className={styles.dashboard__cardTitle}>{template.title}</h3>
                    {template.description && (
                      <p className={styles.dashboard__cardDesc}>{template.description}</p>
                    )}
                    <div className={styles.dashboard__exercisesList}>
                      {template.exercises.map((ex, idx) => (
                        <div key={ex.id || idx} className={styles.dashboard__exerciseItem}>
                          <span className="font-medium text-slate-200">
                            {ex.name || 'Вправа'}
                          </span>
                            <span className="text-slate-400">
                            {ex.sets && `${ex.sets} підх.`} {ex.reps && `/ ${ex.reps} пов.`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.dashboard__cardActions}>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className={styles.dashboard__deleteBtn}
                      title="Видалити шаблон"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};