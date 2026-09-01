import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const IMAGES = [
  {
    src: "assets/2022/01_first_memory_bechamel.jpg",
    alt: "صينية المكرونة بالبشاميل 2022",
  },
  {
    src: "assets/2022/2022_memory_1.jpg",
    alt: "البدايات الحلوة 2022",
  },
  {
    src: "assets/2022/2022_memory_2.jpg",
    alt: "ذكريات 2022",
  },
  {
    src: "assets/2023/2023_memory_1.jpg",
    alt: "خروجات وسفريات 2023",
  },
  {
    src: "assets/2023/2023_memory_2.jpg",
    alt: "سحر 2023",
  },
  {
    src: "assets/2024/2024_medicine.jpg",
    alt: "دكتورة سوسو في كلية الطب 2024",
  },
  {
    src: "assets/2024/2024_memory_1.jpg",
    alt: "نجاح وفخر 2024",
  },
  {
    src: "assets/2024/2024_memory_2.jpg",
    alt: "ضحكة دكتورتنا 2024",
  },
  {
    src: "assets/2025/2025_memory_1.jpg",
    alt: "سهرة النيل 2025",
  },
  {
    src: "assets/2025/2025_memory_2.jpg",
    alt: "احتفال النيل 2025",
  },
  {
    src: "assets/2026/2026_hijab.jpg",
    alt: "خطوة الحجاب ونور العيون 2026",
  },
];

export default function DemoOne() {
  return (
    <ImageStreamHero
      images={IMAGES}
      className="h-[560px] w-full rounded-2xl border border-pink-200/60 bg-white/40 backdrop-blur-md"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight text-[#765469] sm:text-5xl font-cairo">
            ألبوم ذكرياتنا ♡
            <br />
            لحظات محفورة في القلب
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-[#4e4449] font-cairo bg-white/80 backdrop-blur-md py-2 px-4 rounded-full border border-pink-200/60 shadow-sm">
          كل صورة وكل لحظة اتصورت كانت ذكرى محفورة في قلبي، وبتفضل تكبر وتحلى معاكي يا سوسو ❤️
        </p>
      </div>
    </ImageStreamHero>
  );
}
