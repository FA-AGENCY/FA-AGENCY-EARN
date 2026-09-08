import test from 'node:test';
import assert from 'node:assert/strict';
import { assertBotConfig, commandNames, createBot, getBotConfig } from '../src/bot.js';

function fakeBotFactory() {
  const handlers = new Map();
  const middleware = [];
  return {
    handlers,
    middleware,
    use(handler) { middleware.push(handler); },
    command(name, handler) { handlers.set(name, handler); },
    catch(handler) { this.errorHandler = handler; },
    async launch() { this.launched = true; },
    stop(signal) { this.stopped = signal; }
  };
}

test('bot configuration requires token and HTTPS Mini App URL', () => {
  assert.throws(() => assertBotConfig(getBotConfig({})), /TELEGRAM_BOT_TOKEN/);
  assert.throws(() => assertBotConfig({ token: '123:TEST', appUrl: 'http://unsafe.local' }), /HTTPS/);
  assert.doesNotThrow(() => assertBotConfig({ token: '123:TEST', appUrl: 'https://app.example.test' }));
});

test('all required commands register Bengali handlers with the Mini App button', async () => {
  let instance;
  const bot = createBot({ token: '123:TEST', appUrl: 'https://app.example.test' }, {
    botFactory: () => {
      instance = fakeBotFactory();
      return instance;
    },
    logger: { error() {} }
  });
  assert.ok(bot);
  assert.deepEqual([...instance.handlers.keys()].sort(), commandNames.map((name) => name.slice(1)).sort());

  const replies = [];
  await instance.handlers.get('start')({ reply(message, markup) { replies.push({ message, markup }); } });
  assert.match(replies[0].message, /স্বাগতম/);
  assert.equal(replies[0].markup.reply_markup.inline_keyboard[0][0].text, '🚀 আয় শুরু করুন');
});

test('duplicate Telegram updates are ignored safely', async () => {
  let instance;
  createBot({ token: '123:TEST', appUrl: 'https://app.example.test' }, {
    botFactory: () => {
      instance = fakeBotFactory();
      return instance;
    },
    logger: { error() {} }
  });
  const replies = [];
  const context = { update: { update_id: 99 }, reply(message) { replies.push(message); } };
  const next = instance.middleware[0];
  await next(context, () => instance.handlers.get('app')(context));
  await next(context, () => instance.handlers.get('app')(context));
  assert.equal(replies.length, 1);
});

test('bot command errors return Bengali safe messages', async () => {
  let instance;
  createBot({ token: '123:TEST', appUrl: 'https://app.example.test' }, {
    botFactory: () => {
      instance = fakeBotFactory();
      return instance;
    },
    logger: { error() {} }
  });
  const replies = [];
  await instance.errorHandler(new Error('internal failure'), { reply(message) { replies.push(message); } });
  assert.match(replies[0], /সাময়িক সমস্যা/);
  assert.doesNotMatch(replies[0], /internal|token|secret/i);
});
