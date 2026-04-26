#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const TARGET_ARG = process.argv.find((arg) => arg.startsWith('--target='))?.split('=')[1] || 'ru';
const BATCH_SIZE = 5;
const RATE_LIMIT_MS = 1000;

const localeConfig = {
  ru: {
    name: 'Russian',
    pendingToken: '[RU PENDING]',
  },
  en: {
    name: 'English',
    pendingToken: '[EN PENDING]',
  },
  tr: {
    name: 'Turkish',
    pendingToken: '[TR PENDING]',
  },
};

if (!(TARGET_ARG in localeConfig)) {
  console.error(`[translate-locale] Unsupported target locale: ${TARGET_ARG}`);
  process.exit(1);
}

const targetLocale = TARGET_ARG;
const targetMeta = localeConfig[targetLocale];
const sourcePath = join(ROOT, 'messages', 'az.json');
const targetPath = join(ROOT, 'messages', `${targetLocale}.json`);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function flattenObject(value, prefix = '', output = {}) {
  for (const [key, nestedValue] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
      flattenObject(nestedValue, nextKey, output);
      continue;
    }
    output[nextKey] = nestedValue;
  }
  return output;
}

function setDeep(target, path, value) {
  const segments = path.split('.');
  let cursor = target;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    cursor[segment] ??= {};
    cursor = cursor[segment];
  }
  cursor[segments.at(-1)] = value;
}

function shouldTranslate(value) {
  if (typeof value !== 'string') return false;
  return value.trim() === '' || value.includes(targetMeta.pendingToken);
}

async function translateBatch(batch, apiKey) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a professional translator for a B2B SaaS HoReCa platform. Translate Azerbaijani strings to ${targetMeta.name}. Maintain business tone. Keep these brand terms exactly unchanged: KAZAN AI, OCAQ, ŞEDD, SİMAT, Ahilik, DK Agency, AZN. Return strict JSON with the same keys only.`,
        },
        {
          role: 'user',
          content: JSON.stringify(
            Object.fromEntries(batch.map(({ key, source }) => [key, source])),
          ),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek ${response.status}: ${errorText.slice(0, 1000)}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('DeepSeek returned empty content');
  }

  const parsed = JSON.parse(text);
  return parsed;
}

async function main() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY tapılmadı');
  }

  const source = readJson(sourcePath);
  const target = readJson(targetPath);
  const flatSource = flattenObject(source);
  const flatTarget = flattenObject(target);

  const tasks = Object.entries(flatSource)
    .filter(([, sourceValue]) => typeof sourceValue === 'string')
    .map(([key, sourceValue]) => ({
      key,
      source: sourceValue,
      existing: flatTarget[key],
    }))
    .filter(({ existing }) => shouldTranslate(existing));

  if (tasks.length === 0) {
    console.log(`[translate-locale] ${targetLocale}: nothing to translate`);
    return;
  }

  let translatedCount = 0;
  let failedCount = 0;

  for (let index = 0; index < tasks.length; index += BATCH_SIZE) {
    const batch = tasks.slice(index, index + BATCH_SIZE);
    try {
      const translated = await translateBatch(batch, apiKey);
      for (const item of batch) {
        const result = translated[item.key];
        if (typeof result !== 'string' || !result.trim()) {
          failedCount += 1;
          continue;
        }
        setDeep(target, item.key, result.trim());
        translatedCount += 1;
      }
      writeJson(targetPath, target);
    } catch (error) {
      failedCount += batch.length;
      console.error(`[translate-locale] batch failed ${index + 1}-${index + batch.length}: ${String(error)}`);
    }

    if ((translatedCount + failedCount) % 10 === 0 || index + BATCH_SIZE >= tasks.length) {
      console.log(`[translate-locale] ${targetLocale}: ${translatedCount} translated / ${failedCount} failed / ${tasks.length} total`);
    }

    if (index + BATCH_SIZE < tasks.length) {
      await sleep(RATE_LIMIT_MS);
    }
  }
}

main().catch((error) => {
  console.error('[translate-locale] fatal:', error);
  process.exit(1);
});
