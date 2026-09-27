import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { DialogButtons } from "./dialog-buttons";

/** Cancel / submit row shared by every `ResponsiveDialog` form. */
const meta = {
  args: {
    buttonLoadingText: "Saving…",
    buttonText: "Save",
    isPending: false,
    setOpen: () => {},
  },
  component: DialogButtons,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof DialogButtons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Save" })).toBeEnabled();
  },
};

export const Destructive: Story = {
  args: {
    buttonLoadingText: "Deleting…",
    buttonText: "Delete",
    buttonVariant: "destructive",
  },
};

export const Pending: Story = {
  args: { isPending: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: /saving/i })).toBeDisabled();
  },
};

export const SubmitDisabled: Story = {
  args: { buttonDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Save" })).toBeDisabled();
  },
};
