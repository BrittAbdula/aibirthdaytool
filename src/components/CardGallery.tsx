import Image from 'next/image';

const SVG_COUNT = 10; // 假设我们有10个SVG文件，您可以根据实际情况调整这个数字

export default function CardGallery() {
  const svgFiles = Array.from({ length: SVG_COUNT }, (_, i) => `/card/${i + 1}.svg`);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Birthday Card Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {svgFiles.map((svgFile, index) => (
          <div key={index} className="border rounded-lg overflow-hidden shadow-lg">
            <Image
              src={svgFile}
              alt={`SVG Card ${index + 1}`}
              width={400}
              height={600}
              className="w-full h-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
