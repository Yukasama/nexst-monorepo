import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Avatar } from "./avatar";

const meta = {
  argTypes: {
    color: {
      control: "select",
      options: [
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "cyan",
        "blue",
        "indigo",
        "purple",
        "pink",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
    },
  },
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fallback: "H",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("H")).toBeInTheDocument();
  },
};

export const Small: Story = {
  args: {
    fallback: "S",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    fallback: "M",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    fallback: "L",
    size: "lg",
  },
};

export const ExtraLarge: Story = {
  args: {
    fallback: "X",
    size: "xl",
  },
};

export const WithColor: Story = {
  args: {
    color: "blue",
    fallback: "H",
  },
};

export const RainbowColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Avatar color="red" fallback="R" />
      <Avatar color="orange" fallback="O" />
      <Avatar color="amber" fallback="A" />
      <Avatar color="yellow" fallback="Y" />
      <Avatar color="lime" fallback="L" />
      <Avatar color="green" fallback="G" />
      <Avatar color="emerald" fallback="E" />
      <Avatar color="cyan" fallback="C" />
      <Avatar color="blue" fallback="B" />
      <Avatar color="indigo" fallback="I" />
      <Avatar color="purple" fallback="P" />
      <Avatar color="pink" fallback="K" />
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {(["red", "green", "blue", "purple"] as const).map((color, i) => (
        <Avatar
          className="outline-background outline-2"
          color={color}
          fallback={["H", "A", "C", "3"][i]}
          key={color}
          size="md"
        />
      ))}
    </div>
  ),
};
