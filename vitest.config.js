import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // todo-kane/ is a separately forked project (own git repo) that happens
    // to carry copies of these same hook/test files — exclude it so this
    // repo's suite only covers GuardianKane's own source.
    exclude: ['**/node_modules/**', 'todo-kane/**']
  }
});
