// Idempotent: creates MewTruCard pricing catalog. Safe to re-run.
// Usage: STRIPE_SECRET_KEY=sk_xxx node stripe-setup.js
const Stripe = require('stripe');

let key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  const fs = require('fs');
  key = fs.readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').match(/^STRIPE_SECRET_KEY=(.+)$/m)[1].trim();
}
const stripe = new Stripe(key);
const MODE = key.startsWith('sk_live') ? 'LIVE' : 'TEST';

const CATALOG = [
  {
    productKey: 'mewtrucard_plus',
    name: 'MewTruCard Plus',
    description: 'Unlimited cards in every format, including video. Private by default, ad-free, clean downloads.',
    metadata: { tier: 'plus' },
    prices: [
      { lookup_key: 'plus_monthly', unit_amount: 699,  recurring: { interval: 'month' }, nickname: 'Plus Monthly' },
      { lookup_key: 'plus_yearly',  unit_amount: 4900, recurring: { interval: 'year'  }, nickname: 'Plus Yearly'  },
    ],
  },
  {
    productKey: 'mewtrucard_creator_pro',
    name: 'MewTruCard Creator Pro',
    description: 'Everything in Plus, plus recipient roster, 30-day occasion queue, brand preset, batches up to 50, and batch export.',
    metadata: { tier: 'creator_pro' },
    prices: [
      { lookup_key: 'creator_pro_monthly', unit_amount: 1999,  recurring: { interval: 'month' }, nickname: 'Creator Pro Monthly' },
      { lookup_key: 'creator_pro_yearly',  unit_amount: 16900, recurring: { interval: 'year'  }, nickname: 'Creator Pro Yearly'  },
    ],
  },
  {
    productKey: 'mewtrucard_card_pack',
    name: 'MewTruCard Card Pack',
    description: 'A one-time bundle of card credits that never expire, with watermark-free downloads, private sharing, premium styles, and no ads. One card = 1 credit; one video = 5 credits.',
    metadata: { tier: 'card_pack' },
    prices: [
      { lookup_key: 'pack_20', unit_amount: 299, recurring: null, nickname: '20 Card Pack', metadata: { cards: '20' } },
      { lookup_key: 'pack_50', unit_amount: 499, recurring: null, nickname: '50 Card Pack', metadata: { cards: '50' } },
    ],
  },
];

// Superseded SKUs. Stripe never deletes prices/products, so retire them by
// archiving; anything still billing on them keeps billing, new checkouts cannot
// select them. Only ever list SKUs here that have no active subscriptions.
const ARCHIVE = [
  { productKey: 'mewtrucard_card_unlock', lookupKeys: ['card_unlock_once'], reason: 'replaced by card packs' },
];

// products.search / prices.search use an eventually-consistent index, so a re-run
// moments after a create would not see the new object and would duplicate it.
// products.list and prices.list are strongly consistent — use those instead.
async function findProductsByKey(productKey) {
  const matches = [];
  for await (const product of stripe.products.list({ limit: 100 })) {
    if (product.metadata?.product_key === productKey) matches.push(product);
  }
  return matches;
}

// Prefer a live product over an archived one: a key can match both if an earlier
// run left a stale duplicate behind.
async function findProduct(productKey) {
  const matches = await findProductsByKey(productKey);
  return matches.find((p) => p.active) || matches[0] || null;
}

async function findPrice(lookupKey) {
  const res = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  return res.data[0] || null;
}

(async () => {
  console.log(`Stripe mode: ${MODE}\n`);
  const out = {};

  for (const entry of CATALOG) {
    const existingPrice = (await Promise.all(entry.prices.map((spec) => findPrice(spec.lookup_key))))
      .find(Boolean);
    let product = existingPrice
      ? await stripe.products.retrieve(existingPrice.product)
      : await findProduct(entry.productKey);
    if (product) {
      console.log(`= product exists  ${product.id}  ${entry.name}`);
    } else {
      product = await stripe.products.create({
        name: entry.name,
        description: entry.description,
        metadata: { ...entry.metadata, product_key: entry.productKey },
      });
      console.log(`+ product created ${product.id}  ${entry.name}`);
    }

    for (const priceSpec of entry.prices) {
      let price = await findPrice(priceSpec.lookup_key);
      if (price) {
        const matches = price.unit_amount === priceSpec.unit_amount
          && price.product === product.id
          && (priceSpec.recurring ? price.recurring?.interval === priceSpec.recurring.interval : !price.recurring);
        console.log(`  = price exists  ${price.id}  ${priceSpec.lookup_key}  $${(price.unit_amount/100).toFixed(2)}${matches ? '' : '  ** MISMATCH vs spec — left untouched **'}`);
      } else {
        price = await stripe.prices.create({
          product: product.id,
          currency: 'usd',
          unit_amount: priceSpec.unit_amount,
          nickname: priceSpec.nickname,
          lookup_key: priceSpec.lookup_key,
          ...(priceSpec.recurring ? { recurring: priceSpec.recurring } : {}),
          metadata: { tier: entry.metadata.tier, lookup_key: priceSpec.lookup_key, ...(priceSpec.metadata || {}) },
        });
        console.log(`  + price created ${price.id}  ${priceSpec.lookup_key}  $${(price.unit_amount/100).toFixed(2)}`);
      }
      out[priceSpec.lookup_key] = price.id;
    }
  }

  for (const entry of ARCHIVE) {
    for (const lookupKey of entry.lookupKeys) {
      const price = await findPrice(lookupKey);
      if (price?.active) {
        await stripe.prices.update(price.id, { active: false });
        console.log(`- price archived   ${price.id}  ${lookupKey}  (${entry.reason})`);
      }
    }
    for (const product of await findProductsByKey(entry.productKey)) {
      if (!product.active) continue;
      await stripe.products.update(product.id, { active: false });
      console.log(`- product archived ${product.id}  "${product.name}"  (${entry.reason})`);
    }
  }

  console.log('\n--- env values ---');
  console.log(`STRIPE_PLUS_MONTHLY_PRICE_ID=${out.plus_monthly}`);
  console.log(`STRIPE_PLUS_YEARLY_PRICE_ID=${out.plus_yearly}`);
  console.log(`STRIPE_CREATOR_PRO_MONTHLY_PRICE_ID=${out.creator_pro_monthly}`);
  console.log(`STRIPE_CREATOR_PRO_YEARLY_PRICE_ID=${out.creator_pro_yearly}`);
  console.log(`STRIPE_PACK_20_PRICE_ID=${out.pack_20}`);
  console.log(`STRIPE_PACK_50_PRICE_ID=${out.pack_50}`);
  console.log('\nLegacy prices are intentionally left active (existing subscribers bill on them).');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
