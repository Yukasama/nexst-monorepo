import type { Readable } from "node:stream";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "#src/config/app.config.js";
import { ContextLogger } from "#src/logging/context-logger.js";
import { handleError } from "#src/utils/error-handler.util.js";

/** R2's `DeleteObjects` accepts at most this many keys per request. */
const DELETE_BATCH_SIZE = 1000;

export type PutObjectInput = {
  body: Buffer | Readable | string | Uint8Array;
  contentType: string;
  key: string;
  metadata?: Record<string, string>;
};

/**
 * Service for Cloudflare R2 object storage (S3-compatible API).
 *
 * - Uploads and deletes objects in the configured bucket
 * - Signs short-lived GET/PUT URLs so clients never see credentials
 * - Builds public URLs when the bucket is exposed via `R2_PUBLIC_URL`
 */
@Injectable()
export class R2Service {
  private readonly bucket: string;
  private readonly client: S3Client;
  private readonly presignExpiresInSeconds: number;
  private readonly publicUrl?: string;

  constructor(
    cfg: ConfigService<AppConfig, true>,
    private readonly logger: ContextLogger,
  ) {
    const r2 = cfg.get("r2", { infer: true });

    this.bucket = r2.bucket;
    this.presignExpiresInSeconds = r2.presignExpiresInSeconds;
    this.publicUrl = r2.publicUrl?.replace(/\/+$/, "");
    this.client = new S3Client({
      credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
      endpoint: r2.endpoint,
      maxAttempts: r2.maxAttempts,
      region: r2.region,
    });
  }

  /** Deletes a single object; a missing key is not an error. */
  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  /** Deletes many objects, batched to R2's per-request limit. */
  async deleteObjects(keys: string[]): Promise<void> {
    for (let start = 0; start < keys.length; start += DELETE_BATCH_SIZE) {
      const batch = keys.slice(start, start + DELETE_BATCH_SIZE);
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        }),
      );
    }
  }

  /**
   * Signs a URL the client can download the object from.
   *
   * @param key - The object key
   * @param downloadName - When set, the browser saves the file under this name
   */
  getPresignedDownloadUrl(key: string, downloadName?: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...(downloadName
        ? {
            ResponseContentDisposition: `attachment; filename="${downloadName.replaceAll('"', "")}"`,
          }
        : {}),
    });
    return getSignedUrl(this.client, command, { expiresIn: this.presignExpiresInSeconds });
  }

  /** Signs a URL the client can upload one object to directly, bypassing the API. */
  getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      ContentType: contentType,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: this.presignExpiresInSeconds });
  }

  /**
   * The public URL of an object, for buckets exposed through a custom domain
   * or r2.dev (`R2_PUBLIC_URL`). Undefined when the bucket is private.
   */
  getPublicUrl(key: string): string | undefined {
    return this.publicUrl ? `${this.publicUrl}/${key}` : undefined;
  }

  /** Uploads an object and returns its key. */
  async putObject({ body, contentType, key, metadata }: PutObjectInput): Promise<string> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Body: body,
          Bucket: this.bucket,
          ContentType: contentType,
          Key: key,
          Metadata: metadata,
        }),
      );
      this.logger.debug({ key }, "Object uploaded to R2");
      return key;
    } catch (error: unknown) {
      this.logger.error({ error: handleError(error), key }, "R2 upload failed");
      throw error;
    }
  }
}
