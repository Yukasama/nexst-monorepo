import { ClientError } from "graphql-request";
import { describe, expect, it } from "vitest";
import { apiErrorMessage, toApiError } from "./graphql-utils";

describe("toApiError", () => {
  it("maps a dropped connection to NETWORK_ERROR", () => {
    expect(toApiError(new TypeError("Failed to fetch")).code).toBe("NETWORK_ERROR");
  });

  it("reads the code and params from the first GraphQL error", () => {
    const response = {
      errors: [{ extensions: { code: "NOT_FOUND", params: { id: "1" } }, message: "NOT_FOUND" }],
      status: 200,
    } as unknown as ConstructorParameters<typeof ClientError>[0];
    const error = new ClientError(response, { query: "query { x }" });

    expect(toApiError(error)).toMatchObject({ code: "NOT_FOUND", params: { id: "1" } });
  });
});

describe("apiErrorMessage", () => {
  const t = (key: string) => `t:${key}`;

  it("translates known codes", () => {
    expect(apiErrorMessage(t, { code: "UNAUTHORIZED" })).toBe("t:UNAUTHORIZED");
  });

  it("falls back for unknown or missing codes", () => {
    expect(apiErrorMessage(t, { code: "SOMETHING_NEW" })).toBe("t:defaultError");
    expect(apiErrorMessage(t, null)).toBe("t:defaultError");
  });
});
