export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.INVESTEEN_DEMO_SEED === "1") {
    const { ensureDemoSeed } = await import("./lib/demoSeed");
    ensureDemoSeed();
  }
}
