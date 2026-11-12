export interface SetItem {
  id: string;
  weight: number | '';
  reps: number | '';
}

export interface ExerciseLogData {
  exerciseName: string;
  sets: SetItem[];
}