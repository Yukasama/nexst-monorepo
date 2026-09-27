import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { withContainer } from "~sb/decorators";
import { Alert } from "./alert";

const meta = {
  args: { message: "Your changes were saved." },
  component: Alert,
  decorators: [withContainer()],
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Error: Story = {
  args: { message: "Invalid email or password.", variant: "error" },
};

export const Success: Story = { args: { variant: "success" } };

export const Warning: Story = {
  args: { message: "Your session expires soon.", variant: "warning" },
};
