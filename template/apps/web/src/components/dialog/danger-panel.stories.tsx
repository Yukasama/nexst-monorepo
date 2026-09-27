import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { DangerPanel } from "./danger-panel";

const meta = {
  args: {
    message:
      "This permanently removes the item and everything attached to it. This cannot be undone.",
    title: "This action is irreversible",
  },
  component: DangerPanel,
  decorators: [
    (Story) => (
      <div className="w-[26rem]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof DangerPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");

    await expect(alert).toHaveTextContent("This action is irreversible");
  },
};

export const DeleteAccount: Story = {
  args: {
    message:
      "Your profile, uploads, comments and karma will be deleted. Study materials you chose to keep stay available anonymously.",
    title: "Deleting your account is permanent",
  },
};
