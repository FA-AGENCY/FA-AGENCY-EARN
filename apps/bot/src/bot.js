import { Telegraf, Markup } from "telegraf";

const BOT_TOKEN = "8999664421:AAEC4VdrCzjs-YcUlFB7fIWWOFA4gsN_KCY";
const WEB_APP_URL = "https://apps.fa-agency.online";

const bot = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {
  try {
    const welcomeText = 
`👋 হ্যালো, FA AGENCY™ EARN প্ল্যাটফর্মে আপনাকে স্বাগতম!

আপনার অবসর সময়কে কাজে লাগিয়ে প্রতিদিন অনলাইন থেকে আয় করুন। নিচে দেওয়া Open App বাটনে ট্যাপ করে সরাসরি আমাদের মিনি-অ্যাপে প্রবেশ করুন এবং কাজ শুরু করুন।

🚀 Believe in Your Growth — একসাথে শিখি, একসাথে উপার্জন করি।`;

    await ctx.reply(welcomeText, Markup.inlineKeyboard([
      [Markup.button.webApp("🚀 ওপেন করুন Mini App", WEB_APP_URL)]
    ]));
  } catch (err) {
    console.error("Error replying to /start:", err);
  }
});

bot.catch((err) => {
  console.error("Telegraf Error:", err);
});

bot.launch().then(() => {
  console.log(">>> FA AGENCY EARN Bot is ONLINE with native WebApp button! <<<");
}).catch((err) => {
  console.error("Bot Launch Failed:", err);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));