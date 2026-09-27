/**
 * What each optional feature owns in the template. Inline code is handled by
 * `@if` markers (see markers.ts); this manifest covers what markers cannot:
 * whole files/directories, package.json entries and JSON message keys.
 *
 * Keep it in sync when template code for a feature is added or moved —
 * `bun run test` in cli/ generates every combination and typechecks it.
 */

export const FEATURE_NAMES = ["auth", "r2", "ui", "worker"] as const;

export type FeatureName = (typeof FEATURE_NAMES)[number];

type PackageEdits = {
  dependencies?: string[];
  devDependencies?: string[];
  scripts?: string[];
};

export type FeatureManifest = {
  description: string;
  /** JSON files (glob-free) → dotted key paths to delete. */
  jsonKeys?: Record<string, string[]>;
  label: string;
  /** package.json path → entries to delete. */
  packages?: Record<string, PackageEdits>;
  /** Files/directories deleted when the feature is off. */
  paths: string[];
};

const WEB_MESSAGES = ["apps/web/messages/en.json", "apps/web/messages/de.json"];

export const FEATURES: Record<FeatureName, FeatureManifest> = {
  auth: {
    description: "Better Auth (email + password, passkeys, Google, verification & reset mails) in API and web",
    jsonKeys: Object.fromEntries(
      WEB_MESSAGES.map((file) => [
        file,
        [
          "Auth",
          "Dashboard",
          "Header.dashboard",
          "Header.signIn",
          "Header.signOut",
          "Home.cta",
          "ApiErrors.EMAIL_NOT_VERIFIED",
          "ApiErrors.INSUFFICIENT_ROLE",
        ],
      ]),
    ),
    label: "Auth",
    packages: {
      "apps/api/package.json": {
        dependencies: ["@better-auth/passkey", "@thallesp/nestjs-better-auth", "better-auth", "nodemailer", "resend"],
        devDependencies: ["@types/nodemailer"],
        scripts: ["auth:generate"],
      },
      "apps/web/package.json": {
        dependencies: ["@better-auth/passkey", "better-auth", "@hookform/resolvers", "react-hook-form"],
      },
    },
    paths: [
      "apps/api/scripts/auth.cli.ts",
      "apps/api/src/auth",
      "apps/api/src/bootstrap/register-graphql-enums.ts",
      "apps/api/src/mail",
      "apps/api/src/user",
      "apps/api/tests/auth.e2e-spec.ts",
      "apps/web/src/app/[locale]/(auth)",
      "apps/web/src/app/[locale]/dashboard",
      "apps/web/src/components/icons.tsx",
      "apps/web/src/config/routes.ts",
      "apps/web/src/features/auth",
      "apps/web/src/lib/auth-client.ts",
      "apps/web/src/lib/auth-server.ts",
      "apps/web/src/lib/auth.ts",
      "apps/web/tests/auth.spec.ts",
    ],
  },
  r2: {
    description: "Cloudflare R2 object storage service (uploads, presigned URLs)",
    label: "Cloudflare R2",
    packages: {
      "apps/api/package.json": {
        dependencies: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
        devDependencies: ["aws-sdk-client-mock"],
      },
    },
    paths: ["apps/api/src/r2"],
  },
  ui: {
    description: "Extra UI components (dialog, drawer, select, switch, tabs, tooltip, …) with stories",
    jsonKeys: Object.fromEntries(
      WEB_MESSAGES.map((file) => [
        file,
        [
          "Common.cancel",
          "Common.a11y.clearSearch",
          "Common.a11y.close",
          "Common.a11y.scrollDown",
          "Common.a11y.scrollUp",
        ],
      ]),
    ),
    label: "UI components",
    packages: {
      "apps/web/package.json": {
        dependencies: [
          "@radix-ui/react-checkbox",
          "@radix-ui/react-dialog",
          "@radix-ui/react-dropdown-menu",
          "@radix-ui/react-popover",
          "@radix-ui/react-select",
          "@radix-ui/react-tabs",
          "@radix-ui/react-tooltip",
          "vaul",
        ],
      },
    },
    paths: [
      ...[
        "avatar",
        "checkbox",
        "dialog",
        "dialog-buttons.stories.tsx",
        "dialog-buttons.tsx",
        "drawer",
        "dropdown-menu",
        "empty-state.stories.tsx",
        "empty-state.tsx",
        "field-group.stories.tsx",
        "field-group.tsx",
        "field-label.stories.tsx",
        "field-label.tsx",
        "input/input-otp.stories.tsx",
        "input/input-otp.tsx",
        "popover",
        "responsive-dialog",
        "searchbar",
        "select",
        "skeleton",
        "switch",
        "tabs",
        "textarea",
        "tooltip",
      ].map((component) => `apps/web/src/components/${component}`),
      "apps/web/src/lib/hooks",
    ],
  },
  worker: {
    description: "BullMQ worker app + Redis, with shared queue contracts",
    label: "Worker",
    packages: {
      "apps/api/package.json": {
        dependencies: ["@nexst/queues", "@nestjs/bullmq", "bullmq", "ioredis"],
      },
    },
    paths: ["apps/worker", "packages/queues", "apps/api/src/queue"],
  },
};
