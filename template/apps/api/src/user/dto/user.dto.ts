import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserRole } from "#src/generated/prisma/client.js";

@ObjectType("User")
export class UserDto {
  @Field()
  createdAt: Date;

  @Field()
  email: string;

  @Field()
  emailVerified: boolean;

  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  image: null | string;

  @Field(() => String, { nullable: true })
  name: null | string;

  @Field(() => [UserRole])
  role: UserRole[];
}
