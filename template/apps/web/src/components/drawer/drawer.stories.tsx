import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Filter, Menu, Settings, User } from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../button/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

const meta = {
  component: Drawer,
  parameters: {
    layout: "centered",
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /open drawer/i });

    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);
  },
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>
          <Menu size={16} />
          Open Drawer
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>
            This is a drawer component that slides up from the bottom of the screen.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-6">
          <p className="text-sm">
            Drawers are commonly used on mobile devices to show additional options or forms.
          </p>
        </div>
        <DrawerFooter>
          <Button onClick={fn()}>Confirm</Button>
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const WithForm: Story = {
  args: {},
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <Button>
            <User size={16} />
            Edit Profile
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Edit Profile</DrawerTitle>
            <DrawerDescription>Make changes to your profile information.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 px-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <input
                aria-label="Name"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                defaultValue="John Doe"
                id="name"
                placeholder="Enter your name"
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                aria-label="Email"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                defaultValue="john@example.com"
                id="email"
                placeholder="your.email@example.com"
                type="email"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>Save Changes</Button>
            <DrawerClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const FilterDrawer: Story = {
  args: {},
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Filter size={16} />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Filter Options</DrawerTitle>
          <DrawerDescription>Customize your search with these filter options.</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 px-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Category</p>
            <select className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none">
              <option>All Categories</option>
              <option>Documents</option>
              <option>Images</option>
              <option>Videos</option>
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Date Range</p>
            <select className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none">
              <option>Any Time</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last Year</option>
            </select>
          </div>
        </div>
        <DrawerFooter>
          <Button>Apply Filters</Button>
          <DrawerClose asChild>
            <Button variant="secondary">Reset</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const SettingsDrawer: Story = {
  args: {},
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost">
          <Settings size={16} />
          Settings
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>Manage your application preferences.</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-3 px-4 py-4">
          <div className="border-border bg-accent/50 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Enable Notifications</p>
              <p className="text-muted-foreground text-xs">Receive updates about your activity</p>
            </div>
            <input
              aria-label="Enable Notifications"
              className="h-4 w-4"
              defaultChecked
              type="checkbox"
            />
          </div>
          <div className="border-border bg-accent/50 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-muted-foreground text-xs">Switch to dark theme</p>
            </div>
            <input aria-label="Dark Mode" className="h-4 w-4" type="checkbox" />
          </div>
          <div className="border-border bg-accent/50 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Auto-Save</p>
              <p className="text-muted-foreground text-xs">Automatically save changes</p>
            </div>
            <input aria-label="Auto-Save" className="h-4 w-4" defaultChecked type="checkbox" />
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const NoDescription: Story = {
  args: {},
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Simple Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Simple Drawer</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-6">
          <p className="text-sm">This drawer doesn't have a description.</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
