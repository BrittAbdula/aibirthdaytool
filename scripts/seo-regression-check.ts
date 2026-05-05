import assert from "node:assert/strict";
import {
  getCuratedGeneratorSitemapSlugs,
  getGeneratorSeoConfig,
} from "../src/lib/generator-seo";

const birthdaySeo = getGeneratorSeoConfig({
  slug: "birthday",
  label: "Birthday",
  isSystem: true,
});

assert.equal(
  birthdaySeo.seoTitle,
  "Free AI Birthday Card Maker | Share by Link - MewTruCard"
);
assert.equal(birthdaySeo.indexPolicy, "index");
assert.equal(birthdaySeo.primaryIntent, "free AI birthday card maker");

const sorrySeo = getGeneratorSeoConfig({
  slug: "sorry",
  label: "Sorry",
  isSystem: true,
});

assert.match(sorrySeo.seoTitle, /Sorry Website for Girlfriend/);
assert.match(sorrySeo.seoDescription, /apology link/);

const valentineSeo = getGeneratorSeoConfig({
  slug: "valentine",
  label: "Valentine",
  isSystem: true,
});

assert.match(valentineSeo.seoTitle, /Free AI Valentine Card Maker/);
assert.match(valentineSeo.seoDescription, /share by link/);

const happyBirthdaySeo = getGeneratorSeoConfig({
  slug: "happy-birthday",
  label: "Happy Birthday",
  isSystem: false,
});

assert.equal(happyBirthdaySeo.indexPolicy, "index");
assert.equal(happyBirthdaySeo.curatedCanonical, "/happy-birthday/");

const lowQualitySeo = getGeneratorSeoConfig({
  slug: "will-you-be-my-valentine-manghud",
  label: "Will you be my valentine manghud?",
  isSystem: false,
});

assert.equal(lowQualitySeo.indexPolicy, "redirect");
assert.equal(lowQualitySeo.curatedCanonical, "/will-you-be-my-valentine/");

const curatedSitemapSlugs = getCuratedGeneratorSitemapSlugs();
assert.deepEqual(curatedSitemapSlugs, ["happy-birthday", "friendship-card"]);
