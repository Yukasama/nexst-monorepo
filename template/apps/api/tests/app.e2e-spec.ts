import { API_URL, graphql } from "#tests/helpers/api.js";

describe("app (e2e)", () => {
  describe("health", () => {
    it("is ready", async () => {
      const response = await fetch(`${API_URL}/health`);

      expect(response.status).toBe(200);
    });

    it("is live", async () => {
      const response = await fetch(`${API_URL}/health/live`);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ status: "ok" });
    });
  });

  describe("graphql", () => {
    it("answers the public appInfo query", async () => {
      const { data, errors } = await graphql<{ appInfo: { title: string } }>(
        "query { appInfo { title version } }",
      );

      expect(errors).toBeUndefined();
      expect(data?.appInfo.title).toBeTruthy();
    });

    it("rejects malformed input with a machine-readable code", async () => {
      const { errors } = await graphql("query { doesNotExist }");

      expect(errors?.[0]?.extensions?.code).toBeTruthy();
    });
  });
});
