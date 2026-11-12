import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Якщо команда 'build' (деплой), використовуємо '/fit-log/', інакше для локального 'serve' — '/'
    base: command === 'build' ? '/fit-log/' : '/',
  };
});