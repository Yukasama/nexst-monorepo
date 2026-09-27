import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Calendar,
  Clock,
  HelpCircle,
  Info,
  MapPin,
  Settings,
  Share2,
  Tag,
  User,
} from "lucide-react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";

const meta: Meta<typeof Popover> = {
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open Popover" }));

    await expect(await within(document.body).findByText("Popover Title")).toBeInTheDocument();
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Popover Title">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Popover Title</h4>
          <p className="text-muted-foreground text-sm">
            This is a beautiful popover with glassmorphism styling.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Info className="size-4" />
          Information
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex gap-3">
          <div className="bg-brand-500/10 rounded-full p-2">
            <Info className="text-brand-500 size-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-semibold">Did you know?</h4>
            <p className="text-muted-foreground text-xs">
              You can customize the appearance and behavior of this popover using various props.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <User className="size-4" />
            Update Profile
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Update Profile</h4>
              <p className="text-muted-foreground text-xs">Make changes to your profile here.</p>
            </div>
            <div className="space-y-3">
              <Input
                label="Name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                value={name}
              />
              <Input
                label="Email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                value={email}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline">
                Cancel
              </Button>
              <Button size="sm">Save Changes</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

export const QuickActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Settings className="size-4" />
          Quick Actions
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="border-border/40 bg-background/50 hover:bg-accent flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors"
              type="button"
            >
              <Share2 className="text-brand-500 size-5" />
              <span className="text-xs font-medium">Share</span>
            </button>
            <button
              className="border-border/40 bg-background/50 hover:bg-accent flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors"
              type="button"
            >
              <Calendar className="size-5 text-green-500" />
              <span className="text-xs font-medium">Schedule</span>
            </button>
            <button
              className="border-border/40 bg-background/50 hover:bg-accent flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors"
              type="button"
            >
              <Tag className="text-brand-500 size-5" />
              <span className="text-xs font-medium">Tag</span>
            </button>
            <button
              className="border-border/40 bg-background/50 hover:bg-accent flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors"
              type="button"
            >
              <MapPin className="size-5 text-red-500" />
              <span className="text-xs font-medium">Location</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const HelpTooltip: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-sm">Complex Feature</span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            aria-label="Help"
            className="text-muted-foreground hover:text-foreground rounded-full transition-colors"
            type="button"
          >
            <HelpCircle className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Need Help?</h4>
            <p className="text-muted-foreground text-xs">
              This feature allows you to perform advanced operations with custom configurations.
              Click the settings icon to customize your preferences.
            </p>
            <div className="pt-2">
              <Button className="h-auto p-0 text-xs" size="sm" variant="ghost">
                Learn more →
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 p-8">
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              Top
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" side="top">
            <p className="text-center text-xs">Popover positioned at the top</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              Top Start
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48" side="top">
            <p className="text-center text-xs">Aligned to start</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              Top End
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48" side="top">
            <p className="text-center text-xs">Aligned to end</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              Left
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" side="left">
            <p className="text-center text-xs">Positioned on the left</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              Center
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <p className="text-center text-xs">Default position</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              Right
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" side="right">
            <p className="text-center text-xs">Positioned on the right</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              Bottom
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" side="bottom">
            <p className="text-center text-xs">Popover at the bottom</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              Bottom Start
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48" side="bottom">
            <p className="text-center text-xs">Aligned to start</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              Bottom End
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48" side="bottom">
            <p className="text-center text-xs">Aligned to end</p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Popover is:</span>
          <span className="text-sm font-semibold">{open ? "Open" : "Closed"}</span>
        </div>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button variant="outline">Toggle Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Controlled Popover</h4>
              <p className="text-muted-foreground text-xs">
                This popover's open state is controlled externally.
              </p>
              <Button onClick={() => setOpen(false)} size="sm">
                Close Popover
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};

export const WithAnchor: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm">
        This is some text with an{" "}
        <span className="text-brand-500 cursor-pointer font-semibold underline decoration-dotted underline-offset-4">
          anchor element
        </span>{" "}
        that triggers the popover.
      </p>
      <Popover>
        <PopoverAnchor />
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            Show Popover at Anchor
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Anchored Popover</h4>
            <p className="text-muted-foreground text-xs">
              This popover is positioned relative to a custom anchor element in the text above.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const Calendar_Example: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(() => new Date());

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Calendar className="size-4" />
            {date ? date.toLocaleDateString() : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Select Date</h4>
              <div className="grid grid-cols-7 gap-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div className="text-muted-foreground text-center text-xs font-medium" key={day}>
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => i + 1).map((dayNum) => {
                  const dayNumber = dayNum > 31 ? "" : dayNum;
                  return (
                    <button
                      className="hover:bg-accent h-8 w-8 rounded-lg text-xs transition-colors"
                      key={`day-${dayNum}`}
                      onClick={() => setDate(new Date())}
                      type="button"
                    >
                      {dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

export const TimePickerExample: Story = {
  render: () => {
    const [time, setTime] = useState("12:00");

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Clock className="size-4" />
            {time}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Select Time</h4>
            <div className="flex items-center gap-2">
              <Input
                className="text-center"
                containerClassName="flex-1"
                max="23"
                min="0"
                onChange={(e) => setTime(`${e.target.value}:${time.split(":")[1]}`)}
                type="number"
                value={time.split(":")[0]}
              />
              <span className="text-lg font-semibold">:</span>
              <Input
                className="text-center"
                containerClassName="flex-1"
                max="59"
                min="0"
                onChange={(e) => setTime(`${time.split(":")[0]}:${e.target.value}`)}
                type="number"
                value={time.split(":")[1]}
              />
            </div>
            <Button className="w-full" size="sm">
              Set Time
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};
