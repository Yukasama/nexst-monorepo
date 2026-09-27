import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { withContainer } from "~sb/decorators";
import { Input } from "./input";

const meta = {
  args: { label: "Email", placeholder: "you@example.com", type: "email" },
  component: Input,
  decorators: [withContainer()],
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: "Enter a valid email address." },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  },
};

export const Password: Story = {
  args: { label: "Password", placeholder: "", type: "password" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show password" }));
    await expect(canvas.getByLabelText("Password")).toHaveAttribute("type", "text");
  },
};
