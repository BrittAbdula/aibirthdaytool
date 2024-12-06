import Image from 'next/image'
import Link from 'next/link'

interface TrendingCard {
  image: string
  title: string
  link: string
}

const trendingCards: TrendingCard[] = [
    {
      image: '/card/love.svg',
      title: 'Love Card',
      link: '/love/'
    },
    {
      image: '/card/sorry.svg',
      title: 'Sorry Card',
      link: '/sorry/'
    },
    {
      image: '/card/anniversary.svg',
      title: 'Anniversary Card',
      link: '/anniversary/'
    },
    {
      image: '/card/christmas.svg',
      title: 'Christmas Card',
      link: '/christmas/'
    },
    {
      image: '/card/birthday.svg',
      title: 'Birthday Card',
      link: '/birthday/'
    },
    {
      image: '/card/congratulations.svg',
      title: 'Congratulations Card',
      link: '/congratulations/'
    },
    {
      image: '/card/thankyou.svg',
      title: 'Thank You Card',
      link: '/thankyou/'
    },
    {
      image: '/card/holiday.svg',
      title: 'Holiday Card',
      link: '/holiday/'
    },
]

export function TrendingCards() {
  return (
    <section className="my-12 px-4">
      <h2 className="text-3xl font-bold mb-12 text-center">
        Explore what&apos;s <span className="text-purple-600">trending</span>
      </h2>
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex justify-start md:justify-center space-x-4 md:space-x-8 w-max md:w-auto">
          {trendingCards.map((card, index) => (
            <Link href={card.link} key={index} className="group flex-shrink-0 w-64 md:w-80">
              <div className="bg-purple-100 rounded-lg p-4 transition-all duration-300 group-hover:shadow-lg h-full">
                <div className="relative w-full pb-[133.33%] mb-4">
                  <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-105 z-10">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="rounded-md object-contain"
                    />
                  </div>
                </div>
                <p className="text-left font-medium">{card.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}