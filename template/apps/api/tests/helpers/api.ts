export const API_URL = process.env.API_URL ?? "http://localhost:3001";

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: { extensions?: { code?: string; params?: unknown }; message: string }[];
};

/**
 * Sends one GraphQL operation to the running API.
 *
 * @param query - The operation document
 * @param options - Variables and an optional `Cookie` header value (the session)
 */
export async function graphql<TData>(
  query: string,
  { cookie, variables }: { cookie?: string; variables?: Record<string, unknown> } = {},
): Promise<GraphQLResponse<TData>> {
  const response = await fetch(`${API_URL}/graphql`, {
    body: JSON.stringify({ query, variables }),
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    method: "POST",
  });
  return (await response.json()) as GraphQLResponse<TData>;
}
