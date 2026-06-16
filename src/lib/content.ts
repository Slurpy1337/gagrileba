export const site = {
  name: "Gagrileba.ge",
  geName: "გაგრილება.ჯი",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gagrileba.ge",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "+995 551 10 30 55",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "gagrileba@gmail.com",
  messenger: process.env.NEXT_PUBLIC_MESSENGER_URL ?? "https://m.me/gagrileba",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/995551103055",
  address: "ვაჟა ფშაველას 78ა, თბილისი, საქართველო",
  promise: "სწრაფად, მარტივად, გარანტიით.",
};

export const nav = [
  { href: "/", label: "მთავარი" },
  { href: "/air-conditioners", label: "კონდიციონერები" },
  { href: "/installation", label: "მონტაჟი" },
  { href: "/accessories", label: "აქსესუარები" },
  { href: "/calculator", label: "შერჩევა" },
  { href: "/blog", label: "გიდები" },
  { href: "/contact", label: "კონტაქტი" },
];

export const categoryLinks = [
  { slug: "air-conditioners", href: "/air-conditioners", name: "კონდიციონერები", desc: "ოთახის ფართობის მიხედვით შერჩეული მოდელები" },
  { slug: "installation", href: "/installation", name: "მონტაჟი", desc: "პროფესიონალური გუნდი და მკაფიო ფასი" },
  { slug: "accessories", href: "/accessories", name: "აქსესუარები", desc: "სპილენძის მილები და საჭირო ნაწილები" },
];

export const roomRanges = [
  { label: "20-35 მ²", min: 20, max: 35 },
  { label: "35-50 მ²", min: 35, max: 50 },
  { label: "50-70 მ²", min: 50, max: 70 },
  { label: "70+ მ²", min: 70, max: 999 },
];

export const fallbackImage = "/brand/gagrileba-banner.png";
