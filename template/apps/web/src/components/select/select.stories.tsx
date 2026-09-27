import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Flag } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectWithSearch,
} from "./select";

const meta: Meta<typeof Select> = {
  component: Select,
  parameters: {
    // SelectWithSearch renders its search field inside Radix Select's listbox: axe flags
    // `aria-required-children` and the viewport as a non-focusable scroll region.
    a11y: {
      config: {
        rules: [
          { enabled: false, id: "aria-required-children" },
          // Radix hides the rest of the page (aria-hidden) while the listbox is open.
          { enabled: false, id: "aria-hidden-focus" },
          { enabled: false, id: "scrollable-region-focusable" },
        ],
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select a fruit" className="w-70">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select a timezone" className="w-70">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
          <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
          <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
          <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
          <SelectItem value="cet">Central European Time (CET)</SelectItem>
          <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
          <SelectItem value="kst">Korea Standard Time (KST)</SelectItem>
          <SelectItem value="ist">India Standard Time (IST)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger aria-label="Select a fruit" className="w-70" disabled>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select a plan" className="w-70">
        <SelectValue placeholder="Select a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free Plan</SelectItem>
        <SelectItem value="pro">Pro Plan</SelectItem>
        <SelectItem disabled value="enterprise">
          Enterprise Plan (Coming Soon)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const LongList: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select a country" className="w-70">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="uk">United Kingdom</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="fr">France</SelectItem>
        <SelectItem value="es">Spain</SelectItem>
        <SelectItem value="it">Italy</SelectItem>
        <SelectItem value="nl">Netherlands</SelectItem>
        <SelectItem value="be">Belgium</SelectItem>
        <SelectItem value="ch">Switzerland</SelectItem>
        <SelectItem value="at">Austria</SelectItem>
        <SelectItem value="pl">Poland</SelectItem>
        <SelectItem value="se">Sweden</SelectItem>
        <SelectItem value="no">Norway</SelectItem>
        <SelectItem value="dk">Denmark</SelectItem>
        <SelectItem value="fi">Finland</SelectItem>
        <SelectItem value="jp">Japan</SelectItem>
        <SelectItem value="cn">China</SelectItem>
        <SelectItem value="kr">South Korea</SelectItem>
        <SelectItem value="in">India</SelectItem>
        <SelectItem value="au">Australia</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const InForm: Story = {
  render: () => (
    <div className="w-100 space-y-4">
      <div className="space-y-2">
        <p className="ml-0.5 text-sm font-medium">Language Preference</p>
        <Select defaultValue="en">
          <SelectTrigger aria-label="Select a language">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="it">Italiano</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-muted-foreground ml-0.5 text-xs">
          Choose your preferred language for the interface.
        </p>
      </div>
    </div>
  ),
};

const countries = [
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "uk" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "Spain", value: "es" },
  { label: "Italy", value: "it" },
  { label: "Netherlands", value: "nl" },
  { label: "Belgium", value: "be" },
  { label: "Switzerland", value: "ch" },
  { label: "Austria", value: "at" },
  { label: "Poland", value: "pl" },
  { label: "Sweden", value: "se" },
  { label: "Norway", value: "no" },
  { label: "Denmark", value: "dk" },
  { label: "Finland", value: "fi" },
  { label: "Japan", value: "jp" },
  { label: "China", value: "cn" },
  { label: "South Korea", value: "kr" },
  { label: "India", value: "in" },
  { label: "Australia", value: "au" },
  { label: "Canada", value: "ca" },
  { label: "Mexico", value: "mx" },
  { label: "Brazil", value: "br" },
  { label: "Argentina", value: "ar" },
];

export const WithSearch: Story = {
  render: () => {
    const [selectedCountry, setSelectedCountry] = useState("");

    return (
      <div className="w-100 space-y-4">
        <div className="space-y-2">
          <p className="ml-0.5 text-sm font-medium">Country</p>
          <SelectWithSearch
            className="w-full"
            noResultsText="No countries found"
            onValueChange={setSelectedCountry}
            options={countries}
            placeholder="Select a country"
            searchPlaceholder="Search for a country..."
            value={selectedCountry}
          />
          <p className="text-muted-foreground ml-0.5 text-xs">
            Start typing to filter the list of countries.
          </p>
        </div>
      </div>
    );
  },
};

const countriesWithIcons = countries
  .slice(0, 5)
  .map((country) => ({ ...country, icon: <Flag className="size-4 shrink-0" /> }));

export const WithIcons: Story = {
  render: () => {
    const [selectedCountry, setSelectedCountry] = useState("");

    return (
      <div className="w-100 space-y-4">
        <div className="space-y-2">
          <p className="ml-0.5 text-sm font-medium">Country</p>
          <SelectWithSearch
            className="w-full"
            noResultsText="No countries found"
            onValueChange={setSelectedCountry}
            options={countriesWithIcons}
            placeholder="Select a country"
            searchPlaceholder="Search for a country..."
            value={selectedCountry}
          />
          <p className="text-muted-foreground ml-0.5 text-xs">
            Each option carries an icon (e.g. institution logos) shown both in the dropdown and,
            once selected, in the trigger.
          </p>
        </div>
      </div>
    );
  },
};

export const WithControlledSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox"));

    const listbox = await within(document.body).findByRole("listbox");
    await userEvent.type(within(listbox).getByRole("textbox"), "DE");
    await waitFor(() => expect(within(listbox).getAllByRole("option")).toHaveLength(1));
    await expect(within(listbox).getByRole("option")).toHaveTextContent("Germany");
  },
  render: () => {
    const [query, setQuery] = useState("");
    const [value, setValue] = useState("");
    const options = [
      { label: "Germany", value: "DE" },
      { label: "France", value: "FR" },
    ];
    return (
      <div className="w-full max-w-100">
        <SelectWithSearch
          onSearchChange={setQuery}
          onValueChange={setValue}
          options={options.filter((option) => option.value.includes(query.toUpperCase()))}
          searchQuery={query}
          selectedOption={options.find((option) => option.value === value)}
          value={value}
        />
      </div>
    );
  },
};
