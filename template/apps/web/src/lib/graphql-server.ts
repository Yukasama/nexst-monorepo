import "server-only";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { GraphQLClient } from "graphql-request";
import { env } from "@/env";
import type { ApiError } from "./graphql-utils";
import { toApiError } from "./graphql-utils";

const client = new GraphQLClient(`${env.NEXT_PUBLIC_API_URL}/graphql`);

type APIResult<TData> = { data?: TData; error?: ApiError };

/** Server-side API client: forward the incoming cookie to act as the user. */
export async function APIClient<TData, TVars>(
  doc: TypedDocumentNode<TData, TVars>,
  { cookie, variables }: { cookie?: string; variables?: TVars } = {},
): Promise<APIResult<TData>> {
  try {
    // @ts-expect-error -- graphql-request's overloads don't accept an optional variables arg
    const data = await client.request<TData, TVars>(
      doc,
      variables,
      cookie ? { cookie } : undefined,
    );
    return { data };
  } catch (error: unknown) {
    return { error: toApiError(error) };
  }
}
