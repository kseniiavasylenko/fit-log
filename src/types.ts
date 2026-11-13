export interface SetItem {
  id: string;
  weight: number | '';
  reps: number | '';
}

export interface ExerciseLogData {
  id: string;
  date: string;         // Дата виконання (наприклад, "2026-11-13")
  category: string;     // Категорія (наприклад, "Руки", "Спина", "Ноги" тощо)
  exerciseName: string; // Назва вправи
  sets: { weight: number; reps: number }[];
}

export type CategoryType = 'Верх' | 'Низ';

export interface ExerciseSubCategory {
  title: string;
  exercises: string[];
}

export const WORKOUT_CATEGORIES: Record<string, string[]> = {
  'Верх': ['Руки (Біцепс/Трицепс)', 'Спина', 'Плечі', 'Прес'],
  'Nиз': ['Ноги (Квадрицепс/Біцепс стегна)', 'Сідниці']
};

export const EXERCISES_BY_CATEGORY: Record<string, string[]> = {
  'Руки': ['Згинання рук на біцепс', 'Французький жим', 'Розгинання рук на блоці', 'Підтягування зворотним хватом'],
  'Спина': ['Станова тяга', 'Тяга верхнього блоку', 'Тяга штанги в нахилі', 'Горизонтальна тяга'],
  'Плечі': ['Жим гантелей сидячи', 'Махи гантелями в сторони', 'Армійський жим'],
  'Прес': ['Скручування на підлозі', 'Підйом ніг у висі', 'Планка'],
  'Ноги': ['Присідання зі штангою', 'Жим ногами в тренажері', 'Випади з гантелями', 'Зігинання ніг сидячи'],
  'Сідниці': ['Ягідний місток (Hip Thrust)', 'Гіперекстензія', 'Мертва тяга']
};