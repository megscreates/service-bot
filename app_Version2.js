const { App } = require("@slack/bolt");

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false, // We want HTTP for Render
  appToken: process.env.SLACK_APP_TOKEN, // Not needed unless using Socket Mode
});

// A simple slash command, e.g. /hello
app.command("/hello", async ({ ack, say }) => {
  await ack();
  await say("Hello, world! Your Bolt app is live 🚀");
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();