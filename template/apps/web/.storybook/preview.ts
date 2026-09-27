import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/nextjs-vite";
import { withProviders } from "./decorators";
import "../src/app/globals.css";

const preview: Preview = {
  decorators: [
    withProviders,
    // Globals are "Light"/"Dark" (capitalised) — the addon crashes on other values.
    withThemeByClassName({
      defaultTheme: "Light",
      themes: {
        Dark: "dark",
        Light: "",
      },
    }),
  ],
  parameters: {
    a11y: {
      // Every story is an axe check in `bun run test:unit`; violations fail the run.
      test: "error",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
};

export default preview;
