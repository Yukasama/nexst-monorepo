import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Ban, Building2, Users } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("12 total tasks")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("tab", { name: "Active" }));
    await expect(canvas.getByText("8 active tasks")).toBeInTheDocument();
  },
  render: () => (
    <Tabs className="w-[400px]" defaultValue="all">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      <TabsContent className="mt-4 space-y-2" value="all">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-sm">12 total tasks</p>
        </div>
      </TabsContent>
      <TabsContent className="mt-4 space-y-2" value="active">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-sm">8 active tasks</p>
        </div>
      </TabsContent>
      <TabsContent className="mt-4 space-y-2" value="completed">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-sm">4 completed tasks</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs className="w-[350px]" defaultValue="friends">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="friends">
          <Users className="mr-2 h-4 w-4" />
          Friends
        </TabsTrigger>
        <TabsTrigger value="institution">
          <Building2 className="mr-2 h-4 w-4" />
          Institution
        </TabsTrigger>
        <TabsTrigger value="blocked">
          <Ban className="mr-2 h-4 w-4" />
          Blocked
        </TabsTrigger>
      </TabsList>
      <TabsContent className="mt-4" value="friends">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-sm font-medium">23 Friends</p>
          <p className="text-muted-foreground mt-1 text-xs">People you follow</p>
        </div>
      </TabsContent>
      <TabsContent className="mt-4" value="institution">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-sm font-medium">156 Members</p>
          <p className="text-muted-foreground mt-1 text-xs">From your institution</p>
        </div>
      </TabsContent>
      <TabsContent className="mt-4" value="blocked">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-sm font-medium">2 Blocked</p>
          <p className="text-muted-foreground mt-1 text-xs">Users you've blocked</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Tabs className="w-[250px]" defaultValue="friends">
      <TabsList className="grid h-8 w-full grid-cols-3 rounded-full p-0">
        <TabsTrigger
          aria-label="Friends"
          className="data-[state=active]:bg-brand-500 data-[state=inactive]:hover:bg-brand-500/10 h-8 rounded-full data-[state=active]:text-white data-[state=active]:shadow-none"
          value="friends"
        >
          <Users className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger
          aria-label="Institution"
          className="data-[state=active]:bg-brand-500 data-[state=inactive]:hover:bg-brand-500/10 h-8 rounded-full data-[state=active]:text-white data-[state=active]:shadow-none"
          value="institution"
        >
          <Building2 className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger
          aria-label="Blocked"
          className="h-8 rounded-full data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-none data-[state=inactive]:hover:bg-red-500/10"
          value="blocked"
        >
          <Ban className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="friends">
        <p className="text-muted-foreground text-sm">23 friends</p>
      </TabsContent>
      <TabsContent value="institution">
        <p className="text-muted-foreground text-sm">156 members</p>
      </TabsContent>
      <TabsContent value="blocked">
        <p className="text-muted-foreground text-sm">2 blocked</p>
      </TabsContent>
    </Tabs>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <Tabs className="w-[400px]" defaultValue="success">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          className="data-[state=active]:bg-green-700 data-[state=active]:text-white"
          value="success"
        >
          Success
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:bg-amber-700 data-[state=active]:text-white"
          value="warning"
        >
          Warning
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:bg-red-700 data-[state=active]:text-white"
          value="error"
        >
          Error
        </TabsTrigger>
      </TabsList>
      <TabsContent className="mt-4" value="success">
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-400">
            Operation successful
          </p>
          <p className="mt-1 text-xs text-green-800 dark:text-green-500">All systems operational</p>
        </div>
      </TabsContent>
      <TabsContent className="mt-4" value="warning">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Warning detected</p>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-500">
            Some issues need attention
          </p>
        </div>
      </TabsContent>
      <TabsContent className="mt-4" value="error">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-800 dark:text-red-400">Error occurred</p>
          <p className="mt-1 text-xs text-red-800 dark:text-red-500">Action required</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs className="w-[400px]" defaultValue="profile">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger disabled value="billing">
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent className="mt-4" value="profile">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-sm font-medium">Your Profile</p>
          <p className="text-muted-foreground mt-1 text-xs">Manage your personal information</p>
        </div>
      </TabsContent>
      <TabsContent className="mt-4" value="settings">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-sm font-medium">Settings</p>
          <p className="text-muted-foreground mt-1 text-xs">Configure your preferences</p>
        </div>
      </TabsContent>
      <TabsContent className="mt-4" value="billing">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-sm font-medium">Billing</p>
          <p className="text-muted-foreground mt-1 text-xs">Upgrade to access billing</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
