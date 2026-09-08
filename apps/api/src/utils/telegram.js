import crypto from 'crypto';

export function buildTelegramPayload(initData) {
  if (!initData || typeof initData !== 'string') {
    throw new Error('Telegram initData is required.');
  }

  const params = new URLSearchParams(initData);
  const source = {};
  for (const [key, value] of params.entries()) {
    source[key] = value;
  }

  const hash = source.hash || '';
  delete source.hash;

  const keys = Object.keys(source).sort();
  const dataCheckString = keys
    .map((key) => `${key}=${source[key]}`)
    .join('\n');

  return {
    source,
    hash,
    dataCheckString,
    keys,
    params
  };
}

export function generateInternalUid() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let uid = 'FAE-';

  for (let i = 0; i < 8; i += 1) {
    const index = crypto.randomInt(0, alphabet.length);
    uid += alphabet[index];
  }

  return uid;
}

export function generateReferralCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'REF-';

  for (let i = 0; i < 8; i += 1) {
    const index = crypto.randomInt(0, alphabet.length);
    code += alphabet[index];
  }

  return code;
}
