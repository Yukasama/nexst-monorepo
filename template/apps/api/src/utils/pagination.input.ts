import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, Max, Min } from "class-validator";

const MAX_PAGE_SIZE = 100;

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(0)
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Max(MAX_PAGE_SIZE)
  @Min(1)
  take?: number;
}
