/**
 * oxfmt has no `extends` mechanism, so unlike oxlint.ts this is a plain object each
 * app's oxfmt.config.ts spreads into its own `defineConfig({...})` call.
 */
export const baseOxfmtConfig = {
  printWidth: 100,
  sortImports: { newlinesBetween: false },
};
