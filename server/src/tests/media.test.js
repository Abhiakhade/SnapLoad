import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "../app.js";

describe("SnapLoad Media API", () => {
  let server;
  let baseUrl;

  before(async () => {
    server = app.listen(0);

    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });

    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  });

  async function checkInfo(url) {
    const response = await fetch(`${baseUrl}/api/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    return {
      status: response.status,
      data: await response.json(),
    };
  }

  it("detects YouTube links", async () => {
    const result = await checkInfo(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );

    assert.equal(result.status, 200);
    assert.equal(result.data.platform, "YouTube");
    assert.equal(result.data.success, true);
  });

  it("detects Instagram links", async () => {
    const result = await checkInfo("https://www.instagram.com/");

    assert.equal(result.status, 200);
    assert.equal(result.data.platform, "Instagram");
  });

  it("detects Pinterest links", async () => {
    const result = await checkInfo("https://www.pinterest.com/");

    assert.equal(result.status, 200);
    assert.equal(result.data.platform, "Pinterest");
  });

  it("rejects unsupported websites", async () => {
    const result = await checkInfo("https://example.com/video");

    assert.equal(result.status, 422);
    assert.equal(result.data.success, false);
  });

  it("rejects invalid URLs", async () => {
    const result = await checkInfo("not-a-url");

    assert.equal(result.status, 400);
    assert.equal(result.data.success, false);
  });

  it("rejects HTTP links", async () => {
    const result = await checkInfo(
      "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );

    assert.equal(result.status, 400);
    assert.equal(result.data.success, false);
  });
});
