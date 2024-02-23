import { defineConfig } from 'cypress'

export default defineConfig({
  env: { "cypress-plugin-snapshots": {} },
  e2e: {
    async setupNodeEvents(on, config) {
      // e2e testing node events setup code
      (await import('@cypress/code-coverage/task')).default(on, config);
      return config;
    },
    baseUrl: 'http://localhost:8080',
    //reporter: 'cypress-mochawesome-reporter',
    //supportFile: false,
  },
})