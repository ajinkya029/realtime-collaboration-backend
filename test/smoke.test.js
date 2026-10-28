const test = require("node:test");
const assert = require("node:assert/strict");

test("health route is documented", () => {
  const fs = require("node:fs");
  const readme = fs.readFileSync(require("node:path").join(__dirname, "..", "README.md"), "utf8");
  assert.match(readme, /GET \| `\/api\/health`/);
  assert.match(readme, /Socket\.IO events/);
});
