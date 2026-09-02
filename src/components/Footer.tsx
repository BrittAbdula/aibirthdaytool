"use client";

import Link from 'next/link';
import { CARD_TYPES, RELATIONSHIPS } from '@/lib/card-constants';
import { TRUST_HUB_LINKS } from '@/lib/eeat-content';

const FEATURED_TYPES = new Set([
  'birthday',
  'love',
  'sorry',
  'anniversary',
  'thankyou',
  'wedding',
  'valentine',
]);

const FEATURED_RELATIONSHIPS = new Set([
  'friend',
  'mother',
  'father',
  'girlfriend',
  'boyfriend',
  'wife',
]);

export default function Footer() {
  const featuredTypes = CARD_TYPES.filter((t) => FEATURED_TYPES.has(t.type));
  const restTypes = CARD_TYPES.filter((t) => !FEATURED_TYPES.has(t.type));
  const featuredRelationships = RELATIONSHIPS.filter((r) =>
    FEATURED_RELATIONSHIPS.has(r.value)
  );
  const restRelationships = RELATIONSHIPS.filter(
    (r) => !FEATURED_RELATIONSHIPS.has(r.value)
  );

  return (
    <footer className="border-t border-[#F1D6DF]/70 bg-white">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8A93A6]">
              Make a card
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {featuredTypes.map((cardType) => (
                <Link
                  key={cardType.type}
                  href={`/type/${cardType.type}/`}
                  className="text-sm text-[#525B70] transition-colors hover:text-primary"
                >
                  {cardType.label}
                </Link>
              ))}
              <Link
                href="/card-gallery/"
                className="text-sm font-medium text-primary transition-colors hover:text-[#8C2247]"
              >
                All cards →
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8A93A6]">
              For someone special
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {featuredRelationships.map((relation) => (
                <Link
                  key={relation.value}
                  href={`/relationship/${relation.value}/`}
                  className="text-sm text-[#525B70] transition-colors hover:text-primary"
                >
                  {relation.label}
                </Link>
              ))}
              <Link
                href="/cards/#recipient"
                className="text-sm font-medium text-primary transition-colors hover:text-[#8C2247]"
              >
                All recipients →
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8A93A6]">
              About
            </h3>
            <div className="grid gap-2">
              {TRUST_HUB_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#525B70] transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Full directory, tucked away but crawlable */}
        <details className="mb-8 border-t border-[#F1D6DF]/70 pt-5">
          <summary className="cursor-pointer list-none text-sm text-[#8A93A6] transition-colors hover:text-[#525B70]">
            More occasions and recipients →
          </summary>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {restTypes.map((cardType) => (
              <Link
                key={cardType.type}
                href={`/type/${cardType.type}/`}
                className="text-xs text-[#8A93A6] transition-colors hover:text-primary"
              >
                {cardType.label}
              </Link>
            ))}
            {restRelationships.map((relation) => (
              <Link
                key={relation.value}
                href={`/relationship/${relation.value}/`}
                className="text-xs text-[#8A93A6] transition-colors hover:text-primary"
              >
                {relation.label}
              </Link>
            ))}
          </div>
        </details>

        <div className="flex flex-col items-center justify-between space-y-4 border-t border-[#F1D6DF]/70 pt-6 md:flex-row md:space-y-0">
          <p className="order-2 text-sm text-[#8A93A6] md:order-1">
            © {new Date().getFullYear()} MewTruCard. All rights reserved.
          </p>
          <nav className="order-1 md:order-2">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <li>
                <Link
                  href="/pricing/"
                  className="text-sm text-[#8A93A6] transition-colors hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-[#8A93A6] transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-[#8A93A6] transition-colors hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-sm text-[#8A93A6] transition-colors hover:text-primary"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
