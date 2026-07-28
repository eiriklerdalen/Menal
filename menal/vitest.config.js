import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["src/tests/backend/**/*.test.js"],
        setupFiles: ["./src/tests/backend/setup.js"],

        fileParallelism: false,
    },
});