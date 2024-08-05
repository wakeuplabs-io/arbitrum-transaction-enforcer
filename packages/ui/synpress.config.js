import "dotenv/config"
import { defineConfig } from 'cypress'
import synpressPlugins from '@synthetixio/synpress/plugins';

export default defineConfig({
    e2e: {
        env: {
            skip_metamask: process.env.SKIP_METAMASK_SETUP === "true"
        },
        baseUrl: 'http://localhost:3000/',
        specPattern: 'tests/e2e/specs/**/*.ts',
        supportFile: 'tests/support/index.ts',
        video: false,
        screenshotOnRunFailure: false,
        setupNodeEvents(on, config) {
            synpressPlugins(on, config);
            return config
        },
    },
});