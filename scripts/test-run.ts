import axios from "axios";
import { spawn, spawnSync } from "node:child_process";
import { exit } from "node:process";

(async () => {
  let PORT = 7000;
  let TEST_API_PORT = 7002;
  try {
    await axios.get(`http://localhost:5000`, { responseType: "text" });
    PORT = 5000;
    TEST_API_PORT = 3002;
  } catch {
    spawnSync(`cross-env TEST_API_PORT=${TEST_API_PORT} PORT=${PORT} npm run build:cypress`, {
      stdio: "inherit",
      shell: true,
    });
    spawn(`cross-env TEST_API_PORT=${TEST_API_PORT} PORT=${PORT} npm run start:cypress:ci`, {
      stdio: "inherit",
      shell: true,
    });
  }
  spawnSync(
    // eslint-disable-next-line max-len
    `npm run jest:test && cross-env TEST_API_PORT=${TEST_API_PORT} PORT=${PORT} npm run cypress:run`,
    {
      stdio: "inherit",
      shell: true,
    },
  );
  exit();
})();
