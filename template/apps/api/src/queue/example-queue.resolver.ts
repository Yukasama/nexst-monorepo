import { Args, ID, Mutation, Resolver } from "@nestjs/graphql";
import { EnqueueExampleInput } from "#src/queue/dto/enqueue-example.input.js";
import { ExampleQueueService } from "#src/queue/example-queue.service.js";

@Resolver()
export class ExampleQueueResolver {
  constructor(private readonly exampleQueue: ExampleQueueService) {}

  /** Hands a message to apps/worker and returns the BullMQ job id. */
  @Mutation(() => ID)
  enqueueExample(@Args("input") { message }: EnqueueExampleInput): Promise<string> {
    return this.exampleQueue.enqueue(message);
  }
}
