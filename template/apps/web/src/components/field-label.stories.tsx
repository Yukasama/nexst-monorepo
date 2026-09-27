import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { FieldLabel } from "./field-label";

const meta = {
  args: {
    children: "Email address",
    htmlFor: "email",
    required: false,
  },
  component: FieldLabel,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof FieldLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText("Email address");

    await expect(label).toHaveAttribute("for", "email");
    await expect(within(canvasElement).queryByText("*")).not.toBeInTheDocument();
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("*")).toBeInTheDocument();
  },
};
