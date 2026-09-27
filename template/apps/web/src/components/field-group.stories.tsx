import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { withContainer } from "~sb/decorators";
import { Input } from "@/components/input/input";
import { FieldGroup } from "./field-group";

const meta = {
  component: FieldGroup,
  decorators: [withContainer("w-90")],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof FieldGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const FRAMELESS =
  "border-0 rounded-none bg-transparent shadow-none h-auto gap-0 px-0 focus-within:ring-0 focus-within:border-transparent";

export const TwoRows: Story = {
  args: {
    children: (
      <>
        <Input
          aria-label="Title"
          containerClassName="gap-y-0 px-3 pt-2.5 pb-1"
          frameClassName={FRAMELESS}
          placeholder="Title"
        />
        <Input
          aria-label="Description"
          containerClassName="gap-y-0 px-3 pt-1 pb-2.5"
          frameClassName={FRAMELESS}
          placeholder="Description"
          size="sm"
        />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("textbox", { name: "Title" })).toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: "Description" })).toBeInTheDocument();
  },
};
