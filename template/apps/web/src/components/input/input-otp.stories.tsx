"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { InputOTP } from "./input-otp";

const meta: Meta<typeof InputOTP> = {
  args: {
    label: "Verification code",
    length: 6,
    value: "",
  },
  argTypes: {
    disabled: {
      control: "boolean",
    },
    error: {
      control: "text",
    },
    hint: {
      control: "text",
    },
    length: {
      control: { max: 8, min: 3, step: 1, type: "number" },
    },
    value: {
      control: false,
    },
  },
  component: InputOTP,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cells = canvas.getAllByRole("textbox");

    await expect(cells).toHaveLength(6);

    await userEvent.type(cells[0], "4");
    await expect(cells[0]).toHaveValue("4");
  },
  render: (args) => {
    const [code, setCode] = useState(args.value);

    return (
      <InputOTP
        {...args}
        onChange={(next) => {
          setCode(next);
          args.onChange?.(next);
        }}
        onComplete={(next) => {
          args.onComplete?.(next);
        }}
        value={code}
      />
    );
  },
};

export const WithHint: Story = {
  args: {
    hint: "Enter the 6-digit code we emailed you.",
  },
};

export const WithError: Story = {
  args: {
    error: "The code you entered is invalid.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
