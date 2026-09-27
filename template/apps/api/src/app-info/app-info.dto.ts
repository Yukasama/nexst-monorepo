import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType("AppInfo")
export class AppInfoDto {
  @Field()
  title: string;

  @Field()
  version: string;
}
