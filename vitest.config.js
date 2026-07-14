import { defineConfig } from 'vitest/config'

// Vitest config. Defaults are fine for a plain ESM library — auto-discovers
// test/**/*.{test,spec}.{js,mjs} and runs in Node by default.
// Coverage config lives in package.json under the "vitest" key.

export default defineConfig({
    test: {
        include: ['test/**/*.{test,spec}.{js,mjs}'],
        environment: 'node'
    }
})
