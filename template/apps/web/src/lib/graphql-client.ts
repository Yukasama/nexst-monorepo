import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { GraphQLClient } from "graphql-request";
import { env } from "@/env";
import { toApiError } from "./graphql-utils";

const client = new GraphQLClient(`${env.NEXT_PUBLIC_API_URL}/graphql`, {
  credentials: "include",
});

/** Browser-side API client: sends the session cookie, throws `ApiError`s. */
export const graphqlClient = {
  async request<TData, TVars>(
    doc: TypedDocumentNode<TData, TVars>,
    variables?: TVars,
  ): Promise<TData> {
    try {
      // @ts-expect-error -- graphql-request's overloads don't accept an optional variables arg
      return await client.request<TData, TVars>(doc, variables);
    } catch (error) {
      const apiError = toApiError(error);
      // @if auth
      if (apiError.code === "UNAUTHORIZED" && typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      // @endif
      throw apiError;
    }
  },
};
