/** @type {import('@storybook/test-runner').TestRunnerConfig} */
module.exports = {
  timeout: 30000,
  async preVisit(page) {
    page.setDefaultTimeout(15000);
  },
};