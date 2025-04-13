import React from 'react';
import { CardType } from '@/lib/card-config';
import { HeartFilledIcon } from '@radix-ui/react-icons';
import Image from 'next/image';

type Product = {
  id: string;
  title: string;
  image: string;
  link: string;
  price: string;
};

type ProductCategory = 'birthday' | 'valentines' | 'christmas' | 'anniversary';

const affiliateTag = 'your-affiliate-tag'; // ← 可换成真实联盟 tag（或动态生成）

// 所有商品集中定义，便于复用
const productsByCategory: Record<ProductCategory, Product[]> = {
  birthday: [/* 略，为节省空间，使用你的原始 birthday 数据 */],
  valentines: [/* valentines 数据 */],
  christmas: [/* christmas 数据 */],
  anniversary: [/* anniversary 数据 */]
};

// 每种卡片类型推荐哪些商品类型（更灵活！）
const cardToProductCategories: Record<CardType | 'default', ProductCategory[]> = {
  birthday: ['birthday', 'valentines', 'anniversary'],
  valentines: ['valentines', 'anniversary'],
  christmas: ['christmas', 'birthday'],
  anniversary: ['anniversary', 'valentines'],
  default: ['birthday', 'valentines', 'anniversary']
};

interface RecommendedCardsProps {
  cardType: CardType;
}

export function RecommendedCards({ cardType }: RecommendedCardsProps) {
  const fallbackCategories = cardToProductCategories[cardType] || cardToProductCategories['default'];

  // 根据推荐类型拼接产品（扁平合并多个类型的产品）
  const recommendedProducts: Product[] = fallbackCategories
    .flatMap((type) => productsByCategory[type] || [])
    .slice(0, 6); // 限制显示数量（如有需要）

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6 text-center text-[#4A4A4A]">
        ✨ You might also like... ✨
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendedProducts.map((product) => {
          const affiliateLink = `${product.link}?tag=${affiliateTag}`;

          return (
            <a
              key={product.id}
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl bg-white border-2 border-pink-100 p-3 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-pink-300"
              onClick={() => {
                // 跟踪联盟点击
                console.log(`Affiliate product clicked: ${product.id}`);
              }}
            >
              <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-pink-500 text-white p-1.5 rounded-full flex items-center justify-center">
                    <HeartFilledIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-[#4A4A4A] group-hover:text-pink-600 transition-colors duration-300 line-clamp-2">
                {product.title}
              </h3>
              <p className="mt-1 text-pink-500 font-bold">{product.price}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
