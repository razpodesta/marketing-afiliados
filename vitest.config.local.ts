// vitest.config.local.ts
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default defineConfig(mergeConfig(baseConfig, {}));
