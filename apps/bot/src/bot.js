const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_LINK = "https://t.me/FAAgencyEarnAppBot/myapp";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  const welcomeText = 
`👋 হ্যালো, FA AGENCY™ EARN প্ল্যাটফর্মে আপনাকে স্বাগতম!

আপনার অবসর সময়কে কাজে লাগিয়ে প্রতিদিন অনলাইন থেকে আয় করুন। নিচে দেওয়া Open App বাটনে ট্যাপ করে সরাসরি আমাদের মিনি-অ্যাপে প্রবেশ করুন এবং কাজ শুরু করুন।

🚀 Believe in Your Growth — একসাথে শিখি, একসাথে উপার্জন করি।`;

  return ctx.reply(welcomeText, Markup.inlineKeyboard([
    [Markup.button.url("🚀 ওপেন করুন Mini App", APP_LINK)]
  ]));
});

bot.launch().then(() => console.log("Bot running with shortname link..."));