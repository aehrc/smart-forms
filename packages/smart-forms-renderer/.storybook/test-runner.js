/** @type {import('@storybook/test-runner').TestRunnerConfig} */
module.exports = {
  timeout: 15000,
  async preVisit(page) {
    page.setDefaultTimeout(15000);
  },
};