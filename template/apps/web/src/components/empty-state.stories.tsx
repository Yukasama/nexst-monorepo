import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Inbox, SearchX } from "lucide-react";
import { expect, within } from "storybook/test";
import { Button } from "./button/button";
import { EmptyState } from "./empty-state";

const meta = {
  args: { title: "No results found" },
  component: EmptyState,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TextOnly: Story = {
  args: { className: "gap-1 p-3", title: "No modules found" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("No modules found")).toBeInTheDocument();
  },
};

export const WithIcon: Story = {
  args: { icon: SearchX, title: "No results found" },
};

export const WithDescription: Story = {
  args: {
    description: "Try a different search term or remove some filters.",
    icon: SearchX,
    title: "Nothing matched your search",
  },
};

export const WithAction: Story = {
  args: {
    action: <Button size="sm">Create your first deck</Button>,
    description: "Card decks you create or save show up here.",
    icon: Inbox,
    title: "No card decks yet",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Create your first deck" }),
    ).toBeInTheDocument();
  },
};
