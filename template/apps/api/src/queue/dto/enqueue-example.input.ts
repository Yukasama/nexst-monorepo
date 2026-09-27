import { Field, InputType } from "@nestjs/graphql";
import { IsString, MaxLength, MinLength } from "class-validator";

@InputType()
export class EnqueueExampleInput {
  @Field()
  @IsString()
  @MaxLength(500)
  @MinLength(1)
  message: string;
}
