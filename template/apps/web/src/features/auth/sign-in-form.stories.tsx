import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { withContainer } from "~sb/decorators";
import { SignInForm } from "./sign-in-form";

const meta = {
  component: SignInForm,
  decorators: [withContainer()],
} satisfies Meta<typeof SignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(await canvas.findByText("Enter a valid email address.")).toBeInTheDocument();
  },
};
