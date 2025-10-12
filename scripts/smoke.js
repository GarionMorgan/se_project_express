const http = require("http");

function request(options, body) {
  return new Promise((resolve, reject) => {
    let bodyStr = null;
    if (body) bodyStr = JSON.stringify(body);
    // clone headers to avoid mutating the caller's object
    const headers = { ...(options.headers || {}) };
    if (bodyStr) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      headers["Content-Length"] = Buffer.byteLength(bodyStr);
    }
    const reqOptions = { ...options, headers };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data || "{}");
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

(async () => {
  try {
    const userRes = await request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/users",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { name: "smokeUser", avatar: "http://example.com/a.png" }
    );
    console.log("USER", JSON.stringify(userRes));

    const itemRes = await request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/items",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        name: "smokeItem",
        weather: "warm",
        link: "https://example.com/link.test",
      }
    );
    console.log("ITEM", JSON.stringify(itemRes));

    const itemId = itemRes.body && itemRes.body._id;
    const userId = userRes.body && userRes.body._id;
    if (!itemId || !userId) {
      console.error("Missing ids, aborting like test");
      process.exit(2);
    }

    const likeRes = await request(
      {
        hostname: "localhost",
        port: 3001,
        path: `/items/${itemId}/likes`,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      },
      { userId }
    );
    console.log("LIKE", JSON.stringify(likeRes));

    const unlikeRes = await request(
      {
        hostname: "localhost",
        port: 3001,
        path: `/items/${itemId}/likes`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
      { userId }
    );
    console.log("UNLIKE", JSON.stringify(unlikeRes));

    process.exit(0);
  } catch (e) {
    console.error("ERROR", e);
    process.exit(1);
  }
})();
