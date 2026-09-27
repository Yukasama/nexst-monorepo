import { GraphQLError, Kind } from "graphql";
import type {
  ASTVisitor,
  DefinitionNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  SelectionNode,
  ValidationContext,
  ValidationRule,
} from "graphql";

/**
 * Ported from `graphql-depth-limit` (github.com/stems/graphql-depth-limit):
 * that package's `require("graphql")` can't be satisfied under Bun, whose
 * `graphql` package.json resolves to an ESM build Bun refuses to require()
 * synchronously. Node never hit this because it has no "bun" export
 * condition active and falls through to the CJS build instead.
 */
export function depthLimit(maxDepth: number): ValidationRule {
  return (context: ValidationContext): ASTVisitor => {
    const { definitions } = context.getDocument();
    const fragments = getFragments(definitions);
    const operations = getOperations(definitions);

    for (const [name, operation] of operations) {
      determineDepth(operation, fragments, 0, maxDepth, context, name);
    }

    // The check above already ran eagerly against the whole document, so
    // there's nothing left for graphql-js's AST walk to visit.
    return {};
  };
}

function determineDepth(
  node: FragmentDefinitionNode | OperationDefinitionNode | SelectionNode,
  fragments: Map<string, FragmentDefinitionNode>,
  depthSoFar: number,
  maxDepth: number,
  context: ValidationContext,
  operationName: string,
): number {
  if (depthSoFar > maxDepth) {
    context.reportError(
      new GraphQLError(`'${operationName}' exceeds maximum operation depth of ${maxDepth}`, {
        nodes: [node],
      }),
    );
    return 0;
  }

  switch (node.kind) {
    case Kind.FIELD: {
      if (node.name.value.startsWith("__") || !node.selectionSet) {
        return 0;
      }
      return (
        1 +
        Math.max(
          ...node.selectionSet.selections.map((selection) =>
            determineDepth(selection, fragments, depthSoFar + 1, maxDepth, context, operationName),
          ),
        )
      );
    }
    case Kind.FRAGMENT_DEFINITION:
    case Kind.INLINE_FRAGMENT:
    case Kind.OPERATION_DEFINITION:
      return Math.max(
        ...node.selectionSet.selections.map((selection) =>
          determineDepth(selection, fragments, depthSoFar, maxDepth, context, operationName),
        ),
      );
    case Kind.FRAGMENT_SPREAD: {
      const fragment = fragments.get(node.name.value);
      return fragment
        ? determineDepth(fragment, fragments, depthSoFar, maxDepth, context, operationName)
        : 0;
    }
    default:
      throw new Error("depth limit cannot handle this node kind");
  }
}

function getFragments(definitions: readonly DefinitionNode[]) {
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const definition of definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      fragments.set(definition.name.value, definition);
    }
  }
  return fragments;
}

function getOperations(definitions: readonly DefinitionNode[]) {
  const operations = new Map<string, OperationDefinitionNode>();
  for (const definition of definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      operations.set(definition.name?.value ?? "", definition);
    }
  }
  return operations;
}
