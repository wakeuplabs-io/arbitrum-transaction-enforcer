import { defineConfig } from 'cypress'
import synpressPlugins from '@synthetixio/synpress/plugins';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000/',
        specPattern: 'tests/e2e/specs',
        supportFile: 'tests/support/index.ts',
        video: false,
        screenshotOnRunFailure: false,
        setupNodeEvents(on, config) {
            synpressPlugins(on, config);
            return config
        },
    },
});