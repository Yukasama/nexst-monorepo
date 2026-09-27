import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { TabsContent, TabsList, TabsTrigger } from "./tabs";
import { UrlTabs } from "./url-tabs";

const TABS = ["overview", "activity", "settings"] as const;

function UrlTabsExample() {
  return (
    <UrlTabs className="w-96" defaultValue="overview" tabs={TABS}>
      <TabsList className="w-full">
        {TABS.map((tab) => (
          <TabsTrigger className="flex-1 capitalize" key={tab} value={tab}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((tab) => (
        <TabsContent className="text-muted-foreground p-4 text-sm capitalize" key={tab} value={tab}>
          {tab} panel
        </TabsContent>
      ))}
    </UrlTabs>
  );
}

/**
 * `Tabs` that mirror the active tab into `?tab=` so it survives reload and is
 * shareable. The default tab keeps the URL clean.
 */
const meta = {
  component: UrlTabsExample,
  parameters: {
    layout: "centered",
    nextjs: { navigation: { pathname: "/institutions/kit", query: {} } },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UrlTabsExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("tab")).toHaveLength(3);
    await expect(canvas.getByRole("tab", { name: "overview" })).toHaveAttribute(
      "data-state",
      "active",
    );

    await userEvent.click(canvas.getByRole("tab", { name: "activity" }));
  },
};

export const DeepLinkedTab: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/institutions/kit", query: { tab: "settings" } } },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("tab", { name: "settings" })).toHaveAttribute(
      "data-state",
      "active",
    );
  },
};
