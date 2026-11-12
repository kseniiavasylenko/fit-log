export interface SetItem {
  weight: number;
  reps: number;
}

export interface ExerciseLogData {
  exerciseName: string;
  sets: SetItem[];
}