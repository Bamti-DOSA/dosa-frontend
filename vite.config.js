import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  esbuild: {
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  },
  build: {
    // 청크 크기 경고 제한을 2000kB(2MB)로 늘려서 경고 안 뜨게 하기 (선택 사항)
    chunkSizeWarningLimit: 2000, 
    rollupOptions: {
      output: {
        manualChunks: {
          // 1. React 관련 라이브러리 분리
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // 2. 3D 관련 라이브러리 분리 (가장 무거움)
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          // 3. UI 라이브러리 분리 (Lucide 등)
          ui: ['lucide-react'] 
        }
      }
    }
  }
});
