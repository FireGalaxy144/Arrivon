import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Arrivon/',
  plugins: [react()],
  define: {
    // New sample mail each time `npm run dev` starts or the site is built.
    // Refreshing the page keeps the same mail until the next run.
    __MAIL_SEED__: JSON.stringify(Date.now()),
  },
});
