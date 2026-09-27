import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  args: {
    "aria-label": "Accept terms and conditions",
  },
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onCheckedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).not.toBeDisabled();

    await userEvent.click(checkbox);

    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    await userEvent.click(checkbox);

    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).toBeChecked();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onCheckedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).toBeDisabled();
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const DisabledChecked: Story = {
  args: {
    defaultChecked: true,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).toBeDisabled();
    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);

    await expect(checkbox).toBeChecked();
  },
};

export const WithLabel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    const label = canvas.getByText("Accept terms and conditions");

    await expect(checkbox).toBeInTheDocument();
    await expect(label).toBeInTheDocument();
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(label);

    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);

    await expect(checkbox).not.toBeChecked();
  },
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={checked}
          id="terms"
          onCheckedChange={(value) => setChecked(value as boolean)}
        />
        <label
          className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="terms"
        >
          Accept terms and conditions
        </label>
      </div>
    );
  },
};

export const WithLongLabel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    const label = canvas.getByText(/I agree to the terms/i);

    await expect(checkbox).toBeInTheDocument();
    await expect(label).toBeInTheDocument();
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(label);

    await expect(checkbox).toBeChecked();
  },
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div className="flex max-w-md items-start space-x-2">
        <Checkbox
          checked={checked}
          className="mt-1"
          id="terms-long"
          onCheckedChange={(value) => setChecked(value as boolean)}
        />
        <label
          className="cursor-pointer text-sm leading-relaxed font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="terms-long"
        >
          I agree to the terms and conditions, privacy policy, and understand that my data will be
          processed according to the GDPR regulations.
        </label>
      </div>
    );
  },
};

export const FormExample: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    const submitButton = canvas.getByRole("button", { name: /sign up/i });

    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).not.toBeChecked();
    await expect(submitButton).toBeDisabled();

    await userEvent.click(checkbox);

    await expect(checkbox).toBeChecked();
    await expect(submitButton).toBeEnabled();

    await userEvent.click(checkbox);

    await expect(checkbox).not.toBeChecked();
    await expect(submitButton).toBeDisabled();
  },
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <form className="max-w-md space-y-4 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Sign Up</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-email">
            Email
          </label>
          <input
            aria-label="Email"
            className="w-full rounded-md border px-3 py-2"
            id="signup-email"
            placeholder="email@example.com"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-password">
            Password
          </label>
          <input
            aria-label="Password"
            className="w-full rounded-md border px-3 py-2"
            id="signup-password"
            placeholder="********"
            type="password"
          />
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            checked={checked}
            className="mt-1"
            id="signup-terms"
            onCheckedChange={(value) => setChecked(value as boolean)}
          />
          <label className="cursor-pointer text-sm leading-relaxed" htmlFor="signup-terms">
            By signing up, you agree to our{" "}
            <Link className="text-brand-600 underline" href="#">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link className="text-brand-600 underline" href="#">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          className="bg-brand-600 hover:bg-brand-700 w-full rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!checked}
          type="submit"
        >
          Sign Up
        </button>
      </form>
    );
  },
};

export const MultipleCheckboxes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxes = canvas.getAllByRole("checkbox");

    await expect(checkboxes).toHaveLength(4);

    await expect(checkboxes[0]).toBeChecked();
    await expect(checkboxes[1]).not.toBeChecked();
    await expect(checkboxes[2]).toBeChecked();
    await expect(checkboxes[3]).not.toBeChecked();

    await userEvent.click(checkboxes[1]);

    await expect(checkboxes[1]).toBeChecked();

    await userEvent.click(checkboxes[0]);

    await expect(checkboxes[0]).not.toBeChecked();

    const smsLabel = canvas.getByText("Receive SMS notifications");
    await userEvent.click(smsLabel);

    await expect(checkboxes[1]).not.toBeChecked();
  },
  render: () => {
    const [items, setItems] = useState([
      { checked: true, id: "1", label: "Receive email notifications" },
      { checked: false, id: "2", label: "Receive SMS notifications" },
      { checked: true, id: "3", label: "Receive push notifications" },
      { checked: false, id: "4", label: "Marketing emails" },
    ]);

    const handleToggle = (id: string) => {
      setItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
    };

    return (
      <div className="max-w-md space-y-3 rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">Notification Preferences</h3>
        {items.map((item) => (
          <div className="flex items-center space-x-2" key={item.id}>
            <Checkbox
              checked={item.checked}
              id={item.id}
              onCheckedChange={() => handleToggle(item.id)}
            />
            <label className="cursor-pointer text-sm font-medium" htmlFor={item.id}>
              {item.label}
            </label>
          </div>
        ))}
      </div>
    );
  },
};
