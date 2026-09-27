import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByPlaceholderText("Type your message here...");

    await userEvent.type(field, "Hello there");
    await expect(field).toHaveValue("Hello there");
  },
  render: () => <Textarea className="w-[400px]" placeholder="Type your message here..." />,
};

export const WithLabel: Story = {
  render: () => (
    <Textarea className="w-[400px]" label="Message" placeholder="Type your message here..." />
  ),
};

export const WithHint: Story = {
  render: () => (
    <Textarea
      className="w-[400px]"
      hint="This will be displayed on your public profile."
      label="Bio"
      placeholder="Tell us about yourself..."
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <Textarea
      className="w-[400px]"
      error="Description must be at least 10 characters long."
      label="Description"
      placeholder="Enter a description..."
    />
  ),
};

export const Success: Story = {
  render: () => (
    <Textarea
      className="w-[400px]"
      defaultValue="This product exceeded my expectations! The quality is outstanding."
      hint="Your review looks great!"
      isSuccess
      label="Review"
      placeholder="Write your review..."
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Textarea
      className="w-[400px]"
      defaultValue="This textarea is disabled and cannot be edited."
      disabled
      label="Readonly Message"
      placeholder="Type your message here..."
    />
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Textarea
      className="w-[400px]"
      label="Quick Note"
      placeholder="Add a quick note..."
      size="sm"
    />
  ),
};

export const WithRows: Story = {
  render: () => (
    <Textarea
      className="w-[500px]"
      hint="Minimum 500 words required."
      label="Essay"
      placeholder="Write your essay here..."
      rows={10}
    />
  ),
};

export const WithCharacterCount: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const maxLength = 200;

    return (
      <Textarea
        className="w-[400px]"
        hint={`${value.length}/${maxLength} characters`}
        label="Tweet"
        maxLength={maxLength}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What's happening?"
        value={value}
      />
    );
  },
};

export const InForm: Story = {
  render: () => (
    <div className="w-[500px] space-y-6">
      <div className="space-y-4 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold">Contact Form</h3>

        <Textarea
          hint="Please provide as much detail as possible."
          label="Message"
          placeholder="How can we help you?"
          rows={4}
        />

        <Textarea
          label="Additional Notes"
          placeholder="Any additional information..."
          rows={3}
          size="sm"
        />
      </div>
    </div>
  ),
};
