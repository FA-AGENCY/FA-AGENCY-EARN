import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("CRITICAL ERROR: BOT_TOKEN is missing in .env file!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const APP_LINK = "https://t.me/FAAgencyEarnAppBot/myapp";

bot.start(async (ctx) => {
  try {
    const welcomeText = 
`👋 হ্যালো, FA AGENCY™ EARN প্ল্যাটফর্মে আপনাকে স্বাগতম!

আপনার অবসর সময়কে কাজে লাগিয়ে প্রতিদিন অনলাইন থেকে আয় করুন। নিচে দেওয়া Open App বাটনে ট্যাপ করে সরাসরি আমাদের মিনি-অ্যাপে প্রবেশ করুন এবং কাজ শুরু করুন।

🚀 Believe in Your Growth — একসাথে শিখি, একসাথে উপার্জন করি।`;

    await ctx.reply(welcomeText, Markup.inlineKeyboard([
      [Markup.button.url("🚀 ওপেন করুন Mini App", APP_LINK)]
    ]));
  } catch (err) {
    console.error("Error replying to /start:", err);
  }
});

bot.catch((err) => {
  console.error("Telegraf Error:", err);
});

bot.launch().then(() => {
  console.log(">>> FA AGENCY EARN Bot is ONLINE and LISTENING to messages! <<<");
}).catch((err) => {
  console.error("Bot Launch Failed:", err);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));