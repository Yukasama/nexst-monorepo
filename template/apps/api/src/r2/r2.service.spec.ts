import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { mockClient } from "aws-sdk-client-mock";
import { vi } from "vitest";
import { ContextLogger } from "#src/logging/context-logger.js";
import { R2Service } from "#src/r2/r2.service.js";

describe("r2Service", () => {
  const s3Mock = mockClient(S3Client);
  let service: R2Service;

  const build = async (publicUrl?: string) => {
    const r2 = {
      accessKeyId: "test-key",
      bucket: "test-bucket",
      endpoint: "https://account.r2.cloudflarestorage.com",
      maxAttempts: 3,
      presignExpiresInSeconds: 600,
      publicUrl,
      region: "auto",
      secretAccessKey: "test-secret",
    };

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        R2Service,
        { provide: ConfigService, useValue: { get: vi.fn(() => r2) } },
        { provide: ContextLogger, useValue: { debug: vi.fn(), error: vi.fn() } },
      ],
    }).compile();

    service = mod.get(R2Service);
  };

  beforeEach(async () => {
    s3Mock.reset();
    await build();
  });

  it("uploads an object to the configured bucket", async () => {
    s3Mock.on(PutObjectCommand).resolves({ ETag: "etag" });

    const key = await service.putObject({ body: "hello", contentType: "text/plain", key: "a.txt" });

    expect(key).toBe("a.txt");
    expect(s3Mock.commandCalls(PutObjectCommand)[0].args[0].input).toMatchObject({
      Bucket: "test-bucket",
      ContentType: "text/plain",
      Key: "a.txt",
    });
  });

  it("rethrows upload failures", async () => {
    s3Mock.on(PutObjectCommand).rejects(new Error("Upload failed"));

    await expect(
      service.putObject({ body: "x", contentType: "text/plain", key: "a.txt" }),
    ).rejects.toThrow("Upload failed");
  });

  it("deletes a single object", async () => {
    s3Mock.on(DeleteObjectCommand).resolves({});

    await service.deleteObject("a.txt");

    expect(s3Mock.commandCalls(DeleteObjectCommand)[0].args[0].input).toEqual({
      Bucket: "test-bucket",
      Key: "a.txt",
    });
  });

  it("batches bulk deletes to 1000 keys per request", async () => {
    s3Mock.on(DeleteObjectsCommand).resolves({});
    const keys = Array.from({ length: 1001 }, (_, index) => `file-${index}`);

    await service.deleteObjects(keys);

    const calls = s3Mock.commandCalls(DeleteObjectsCommand);
    expect(calls).toHaveLength(2);
    expect(calls[1].args[0].input.Delete?.Objects).toEqual([{ Key: "file-1000" }]);
  });

  it("does not call R2 for an empty key list", async () => {
    await service.deleteObjects([]);

    expect(s3Mock.commandCalls(DeleteObjectsCommand)).toHaveLength(0);
  });

  it("signs a download URL with an attachment filename", async () => {
    const url = await service.getPresignedDownloadUrl("docs/a.pdf", 'My "File".pdf');

    expect(url).toContain("test-bucket");
    expect(url).toContain("docs/a.pdf");
    expect(decodeURIComponent(url)).toContain('filename="My File.pdf"');
  });

  it("signs an upload URL", async () => {
    const url = await service.getPresignedUploadUrl("docs/b.pdf", "application/pdf");

    expect(url).toContain("X-Amz-Signature");
  });

  it("builds public URLs only when a public base is configured", async () => {
    expect(service.getPublicUrl("a.png")).toBeUndefined();

    await build("https://cdn.example.com/");

    expect(service.getPublicUrl("a.png")).toBe("https://cdn.example.com/a.png");
  });
});
