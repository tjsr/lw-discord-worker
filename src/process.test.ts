describe("Process", () => {
  test("process", async () => {
    const process = require("process");
    const TokenExpiryOffset =
      process === undefined || isNaN(Number(process.env.TOKEN_EXPIRY_OFFSET))
        ? 0
        : Number(process.env.TOKEN_EXPIRY_OFFSET);
  });
});
