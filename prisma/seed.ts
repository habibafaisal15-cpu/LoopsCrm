import { ensureSeeded } from "../src/server/seed";

ensureSeeded()
  .then(() => {
    console.log("Team accounts are ready.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
