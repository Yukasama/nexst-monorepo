import { Reflector } from "@nestjs/core";
import {
  IS_EMAIL_VERIFIED_KEY,
  IsEmailVerified,
} from "#src/auth/decorator/is-email-verified.decorator.js";

describe("isEmailVerified", () => {
  it("should set metadata to true", () => {
    const decorator = IsEmailVerified();

    class TestClass {
      @decorator
      testMethod() {
        return "test";
      }
    }

    const reflector = new Reflector();
    const metadata = reflector.get(IS_EMAIL_VERIFIED_KEY, TestClass.prototype.testMethod);

    expect(metadata).toBe(true);
  });

  it("should be usable as a method decorator", () => {
    class TestController {
      @IsEmailVerified()
      testMethod() {
        return "test";
      }
    }

    const reflector = new Reflector();
    const metadata = reflector.get(IS_EMAIL_VERIFIED_KEY, TestController.prototype.testMethod);

    expect(metadata).toBe(true);
  });

  it("should have the correct metadata key", () => {
    expect(IS_EMAIL_VERIFIED_KEY).toBe("auth:is-email-verified");
  });
});
