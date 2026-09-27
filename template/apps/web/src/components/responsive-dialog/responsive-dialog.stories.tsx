import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertCircle, FileText, Mail, Share2, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../button/button";
import { ResponsiveDialog } from "./responsive-dialog";

const meta = {
  argTypes: {
    open: {
      control: "boolean",
    },
  },
  component: ResponsiveDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ResponsiveDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: false,
    setOpen: () => {},
    title: "",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /open dialog/i });

    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <ResponsiveDialog
          description="This dialog adapts to screen size - it's a dialog on desktop and a drawer on mobile."
          open={open}
          setOpen={setOpen}
          title="Responsive Dialog"
        >
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Try resizing your browser window or viewing this on different devices to see how it
              adapts.
            </p>
            <p className="text-muted-foreground text-sm">
              The component automatically switches between a centered dialog and a bottom drawer
              based on the viewport width.
            </p>
          </div>
        </ResponsiveDialog>
      </>
    );
  },
};

export const WithForm: Story = {
  args: {
    open: false,
    setOpen: () => {},
    title: "",
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = () => {
      fn()(email);
      setOpen(false);
      setEmail("");
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>
          <Mail size={16} />
          Share Document
        </Button>
        <ResponsiveDialog
          description="Enter the email address of the person you want to share this document with."
          open={open}
          setOpen={setOpen}
          title="Share Document"
        >
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email Address
              </label>
              <input
                aria-label="Email Address"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                type="email"
                value={email}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="message">
                Message (Optional)
              </label>
              <textarea
                aria-label="Message (Optional)"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                id="message"
                placeholder="Add a personal message..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" disabled={!email} onClick={handleSubmit}>
                <Share2 size={16} />
                Send Invitation
              </Button>
            </div>
          </div>
        </ResponsiveDialog>
      </>
    );
  },
};

export const UploadFile: Story = {
  args: {
    open: false,
    setOpen: () => {},
    title: "",
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>
          <Upload size={16} />
          Upload File
        </Button>
        <ResponsiveDialog
          description="Select a file to upload to your document library."
          open={open}
          setOpen={setOpen}
          title="Upload Document"
        >
          <div className="space-y-4 py-4">
            <div className="border-border bg-accent/50 rounded-lg border-2 border-dashed p-8 text-center">
              <Upload className="text-muted-foreground mx-auto h-12 w-12" />
              <p className="mt-2 text-sm font-medium">Drop files here or click to browse</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Supports: PDF, DOCX, XLSX (Max 10MB)
              </p>
              <Button className="mt-4" size="sm" variant="outline">
                Browse Files
              </Button>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setOpen(false)}>
                Start Upload
              </Button>
            </div>
          </div>
        </ResponsiveDialog>
      </>
    );
  },
};

export const DeleteConfirmation: Story = {
  args: {
    open: false,
    setOpen: () => {},
    title: "",
  },
  render: () => {
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
      fn()();
      setOpen(false);
    };

    return (
      <>
        <Button onClick={() => setOpen(true)} variant="destructive">
          <Trash2 size={16} />
          Delete Document
        </Button>
        <ResponsiveDialog
          description="This action cannot be undone. This will permanently delete the document and remove all associated data."
          open={open}
          setOpen={setOpen}
          title="Delete Document"
        >
          <div className="space-y-4 py-4">
            <div className="border-destructive/50 bg-destructive/5 flex items-start gap-3 rounded-lg border p-4">
              <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Warning</p>
                <p className="text-muted-foreground text-sm">
                  Are you absolutely sure you want to delete this document? This action is
                  irreversible.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleDelete} variant="destructive">
                <Trash2 size={16} />
                Delete Permanently
              </Button>
            </div>
          </div>
        </ResponsiveDialog>
      </>
    );
  },
};

export const DocumentPreview: Story = {
  args: {
    open: false,
    setOpen: () => {},
    title: "",
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)} variant="outline">
          <FileText size={16} />
          View Details
        </Button>
        <ResponsiveDialog
          description="View information about this document."
          open={open}
          setOpen={setOpen}
          title="Document Details"
        >
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="border-border bg-accent/50 flex justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">File Name</span>
                <span className="text-muted-foreground text-sm">Annual_Report_2024.pdf</span>
              </div>
              <div className="border-border bg-accent/50 flex justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">Size</span>
                <span className="text-muted-foreground text-sm">2.4 MB</span>
              </div>
              <div className="border-border bg-accent/50 flex justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">Last Modified</span>
                <span className="text-muted-foreground text-sm">Dec 15, 2024</span>
              </div>
              <div className="border-border bg-accent/50 flex justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">Created By</span>
                <span className="text-muted-foreground text-sm">John Doe</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setOpen(false)} variant="outline">
                Download
              </Button>
              <Button className="flex-1" onClick={() => setOpen(false)}>
                Open
              </Button>
            </div>
          </div>
        </ResponsiveDialog>
      </>
    );
  },
};

export const NoDescription: Story = {
  args: {
    open: false,
    setOpen: () => {},
    title: "",
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)} variant="outline">
          Open Simple Dialog
        </Button>
        <ResponsiveDialog open={open} setOpen={setOpen} title="Simple Dialog">
          <div className="py-4">
            <p className="text-sm">
              This responsive dialog doesn't have a description, just a title and content.
            </p>
          </div>
        </ResponsiveDialog>
      </>
    );
  },
};
