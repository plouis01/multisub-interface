import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],

          // React Router
          'router': ['react-router-dom'],

          // Web3 core
          'wagmi': ['wagmi', 'viem'],

          // RainbowKit
          'rainbowkit': ['@rainbow-me/rainbowkit'],

          // Safe SDK
          'safe-sdk': [
            '@safe-global/protocol-kit',
            '@safe-global/safe-core-sdk-types',
            '@safe-global/safe-core-sdk-utils',
          ],

          // TanStack Query
          'tanstack': ['@tanstack/react-query'],

          // Animation
          'framer': ['framer-motion'],

          // GraphQL
          'graphql': ['graphql', 'graphql-request'],

          // UI utilities
          'ui-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
  },
})
