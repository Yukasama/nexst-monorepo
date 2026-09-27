import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Searchbar } from "./searchbar";

const meta = {
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Disables the searchbar",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
  },
  component: Searchbar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Searchbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "w-96",
    placeholder: "Suche nach Dokumenten, Karteikarten...",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox");

    await expect(canvas.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();

    await userEvent.type(field, "thermodynamics");
    await expect(field).toHaveValue("thermodynamics");

    await userEvent.click(await canvas.findByRole("button", { name: /clear/i }));
    await expect(field).toHaveValue("");
  },
};

export const WithLabel: Story = {
  args: {
    className: "w-96",
    label: "Suche",
    placeholder: "Suche nach Dokumenten, Karteikarten...",
  },
};

export const Disabled: Story = {
  args: {
    className: "w-96",
    disabled: true,
    placeholder: "Suche nach Dokumenten, Karteikarten...",
  },
};
