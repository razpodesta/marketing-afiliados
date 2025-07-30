// vitest.config.ts
import react from "file:///C:/Users/VAIO/apps/aaa-proyectos-propios/___marketing-afiliados-container/marketing-afiliados/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.19_@types+node@20.19.9_/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { defineConfig, loadEnv } from "file:///C:/Users/VAIO/apps/aaa-proyectos-propios/___marketing-afiliados-container/marketing-afiliados/node_modules/.pnpm/vite@5.4.19_@types+node@20.19.9/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\VAIO\\apps\\aaa-proyectos-propios\\___marketing-afiliados-container\\marketing-afiliados";
var vitestConfig = {
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./")
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // CORRECCIÓN DE FIABILIDAD: El middleware es una pieza de lógica crítica
      // y debe estar incluido en el informe de cobertura de pruebas para
      // garantizar que está siendo testeado adecuadamente.
      exclude: [
        "**/*.config.{js,ts,mjs}",
        "**/*.d.ts",
        "**/lib/dev/**",
        "**/scripts/**",
        "**/public/**",
        "**/components/ui/**",
        "**/.next/**",
        "**/coverage/**",
        "**/.*rc.{js,json}"
        // "**/middleware.ts", // <-- ELIMINADO DE LA EXCLUSIÓN
      ]
    }
  }
};
var vitest_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    ...vitestConfig,
    define: Object.keys(env).reduce((prev, key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        prev[`process.env.${key}`] = JSON.stringify(env[key]);
      }
      return prev;
    }, {})
  };
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFZBSU9cXFxcYXBwc1xcXFxhYWEtcHJveWVjdG9zLXByb3Bpb3NcXFxcX19fbWFya2V0aW5nLWFmaWxpYWRvcy1jb250YWluZXJcXFxcbWFya2V0aW5nLWFmaWxpYWRvc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVkFJT1xcXFxhcHBzXFxcXGFhYS1wcm95ZWN0b3MtcHJvcGlvc1xcXFxfX19tYXJrZXRpbmctYWZpbGlhZG9zLWNvbnRhaW5lclxcXFxtYXJrZXRpbmctYWZpbGlhZG9zXFxcXHZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1ZBSU8vYXBwcy9hYWEtcHJveWVjdG9zLXByb3Bpb3MvX19fbWFya2V0aW5nLWFmaWxpYWRvcy1jb250YWluZXIvbWFya2V0aW5nLWFmaWxpYWRvcy92aXRlc3QuY29uZmlnLnRzXCI7Ly8gUnV0YTogdml0ZXN0LmNvbmZpZy50c1xuLyoqXG4gKiBAZmlsZSB2aXRlc3QuY29uZmlnLnRzXG4gKiBAZGVzY3JpcHRpb24gQ29uZmlndXJhY2lcdTAwRjNuIHByaW5jaXBhbCBwYXJhIGVsIGNvcnJlZG9yIGRlIHBydWViYXMgVml0ZXN0LlxuICogICAgICAgICAgICAgIEVzdGUgYXBhcmF0byBjb25zdHJ1eWUgdW4gXCJzaW11bGFkb3IgZGUgdnVlbG9cIiBwYXJhIG51ZXN0cm8gY1x1MDBGM2RpZ28sXG4gKiAgICAgICAgICAgICAgY3JlYW5kbyB1biBlbnRvcm5vIHF1ZSBpbWl0YSBhbCBuYXZlZ2Fkb3IgcGFyYSBlamVjdXRhciBwcnVlYmFzXG4gKiAgICAgICAgICAgICAgZGUgZm9ybWEgc2VndXJhIHkgcHJlZGVjaWJsZS5cbiAqIEBhdXRob3IgTC5JLkEgTGVnYWN5ICYgVmFsaWRhdG9yXG4gKiBAdmVyc2lvbiA0LjAuMCAoQ0kvQ0QgT3B0aW1pemVkICYgQ3JpdGljYWwgQ292ZXJhZ2UgRml4KVxuICovXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgdHlwZSBDb25maWdFbnYsIGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgdHlwZSB7IFVzZXJDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuXG5jb25zdCB2aXRlc3RDb25maWc6IFVzZXJDb25maWcgPSB7XG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXG4gICAgc2V0dXBGaWxlczogXCIuL3ZpdGVzdC5zZXR1cC50c1wiLFxuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL1wiKSxcbiAgICB9LFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICBwcm92aWRlcjogXCJ2OFwiLFxuICAgICAgcmVwb3J0ZXI6IFtcInRleHRcIiwgXCJqc29uXCIsIFwiaHRtbFwiXSxcbiAgICAgIC8vIENPUlJFQ0NJXHUwMEQzTiBERSBGSUFCSUxJREFEOiBFbCBtaWRkbGV3YXJlIGVzIHVuYSBwaWV6YSBkZSBsXHUwMEYzZ2ljYSBjclx1MDBFRHRpY2FcbiAgICAgIC8vIHkgZGViZSBlc3RhciBpbmNsdWlkbyBlbiBlbCBpbmZvcm1lIGRlIGNvYmVydHVyYSBkZSBwcnVlYmFzIHBhcmFcbiAgICAgIC8vIGdhcmFudGl6YXIgcXVlIGVzdFx1MDBFMSBzaWVuZG8gdGVzdGVhZG8gYWRlY3VhZGFtZW50ZS5cbiAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgXCIqKi8qLmNvbmZpZy57anMsdHMsbWpzfVwiLFxuICAgICAgICBcIioqLyouZC50c1wiLFxuICAgICAgICBcIioqL2xpYi9kZXYvKipcIixcbiAgICAgICAgXCIqKi9zY3JpcHRzLyoqXCIsXG4gICAgICAgIFwiKiovcHVibGljLyoqXCIsXG4gICAgICAgIFwiKiovY29tcG9uZW50cy91aS8qKlwiLFxuICAgICAgICBcIioqLy5uZXh0LyoqXCIsXG4gICAgICAgIFwiKiovY292ZXJhZ2UvKipcIixcbiAgICAgICAgXCIqKi8uKnJjLntqcyxqc29ufVwiLFxuICAgICAgICAvLyBcIioqL21pZGRsZXdhcmUudHNcIiwgLy8gPC0tIEVMSU1JTkFETyBERSBMQSBFWENMVVNJXHUwMEQzTlxuICAgICAgXSxcbiAgICB9LFxuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfTogQ29uZmlnRW52KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgXCJcIik7XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgLi4udml0ZXN0Q29uZmlnLFxuICAgIGRlZmluZTogT2JqZWN0LmtleXMoZW52KS5yZWR1Y2UoKHByZXY6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sIGtleSkgPT4ge1xuICAgICAgaWYgKGtleS5zdGFydHNXaXRoKFwiTkVYVF9QVUJMSUNfXCIpKSB7XG4gICAgICAgIHByZXZbYHByb2Nlc3MuZW52LiR7a2V5fWBdID0gSlNPTi5zdHJpbmdpZnkoZW52W2tleV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByZXY7XG4gICAgfSwge30pLFxuICB9O1xufSk7XG4vLyBSdXRhOiB2aXRlc3QuY29uZmlnLnRzXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBVUEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUF5QixjQUFjLGVBQWU7QUFadEQsSUFBTSxtQ0FBbUM7QUFlekMsSUFBTSxlQUEyQjtBQUFBLEVBQy9CLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLElBQUk7QUFBQSxJQUNuQztBQUFBLElBQ0EsVUFBVTtBQUFBLE1BQ1IsVUFBVTtBQUFBLE1BQ1YsVUFBVSxDQUFDLFFBQVEsUUFBUSxNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJakMsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBO0FBQUEsTUFFRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHdCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBaUI7QUFDbkQsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixHQUFHO0FBQUEsSUFDSCxRQUFRLE9BQU8sS0FBSyxHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQThCLFFBQVE7QUFDckUsVUFBSSxJQUFJLFdBQVcsY0FBYyxHQUFHO0FBQ2xDLGFBQUssZUFBZSxHQUFHLEVBQUUsSUFBSSxLQUFLLFVBQVUsSUFBSSxHQUFHLENBQUM7QUFBQSxNQUN0RDtBQUNBLGFBQU87QUFBQSxJQUNULEdBQUcsQ0FBQyxDQUFDO0FBQUEsRUFDUDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
