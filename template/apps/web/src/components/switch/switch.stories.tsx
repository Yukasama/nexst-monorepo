import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Switch } from "./switch";

const meta = {
  args: {
    "aria-label": "Email notifications",
    checked: false,
    disabled: false,
    onCheckedChange: fn(),
  },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch");

    await expect(toggle).toHaveAttribute("aria-checked", "false");
  },
};

export const On: Story = {
  args: { checked: true },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch");

    await expect(toggle).toHaveAttribute("aria-checked", "true");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch");

    await expect(toggle).toBeDisabled();

    await userEvent.click(toggle);

    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch");

    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await userEvent.click(toggle);

    await expect(toggle).toHaveAttribute("aria-checked", "true");
  },
  render: (args) => {
    const [checked, setChecked] = useState(false);

    return <Switch {...args} checked={checked} onCheckedChange={setChecked} />;
  },
};
