import { createBlogPost, createFAQ } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const field = "h-11 rounded-lg border border-[#0ea5e9]/24 px-3 text-sm";
const area = "min-h-24 rounded-lg border border-[#0ea5e9]/24 p-3 text-sm";

export default async function CmsPage() {
  const [posts, faqs] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.fAQ.findMany({ orderBy: [{ sortOrder: "asc" }, { question: "asc" }], take: 40 }),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-black">CMS</h1>
      <p className="mt-2 text-sm text-slate-600">ბლოგის პოსტები და FAQ ჩანაწერები.</p>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-black">ახალი ბლოგ პოსტი</h2>
          <form action={createBlogPost} className="mt-4 grid gap-3">
            <input name="title" required placeholder="სათაური" className={field} />
            <input name="slug" placeholder="slug" className={field} />
            <input name="category" placeholder="კატეგორია" className={field} />
            <input name="author" placeholder="ავტორი" className={field} />
            <input name="coverImageUrl" placeholder="სურათის URL" className={field} />
            <textarea name="excerpt" required placeholder="მოკლე აღწერა" className={area} />
            <textarea name="body" required placeholder="ტექსტი" className="min-h-48 rounded-lg border border-[#0ea5e9]/24 p-3 text-sm" />
            <select name="status" defaultValue="draft" className={field}><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select>
            <input name="seoTitle" placeholder="SEO სათაური" className={field} />
            <textarea name="seoDescription" placeholder="SEO აღწერა" className={area} />
            <Button>პოსტის დამატება</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="font-black">ახალი FAQ</h2>
          <form action={createFAQ} className="mt-4 grid gap-3">
            <input name="question" required placeholder="კითხვა" className={field} />
            <textarea name="answer" required placeholder="პასუხი" className={area} />
            <input name="category" placeholder="კატეგორია" className={field} />
            <input name="sortOrder" placeholder="სორტირება" inputMode="numeric" className={field} />
            <label className="flex items-center gap-2 text-sm font-bold"><input name="isPublished" type="checkbox" defaultChecked /> გამოქვეყნებულია</label>
            <Button>FAQ დამატება</Button>
          </form>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-[#0ea5e9]/12 p-4 font-black">ბოლო პოსტები</div>
          <div className="grid divide-y divide-[#0ea5e9]/10">
            {posts.map((post) => <div key={post.id} className="p-4"><strong>{post.title}</strong><p className="text-sm text-slate-600">{post.status} / {post.slug}</p></div>)}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-[#0ea5e9]/12 p-4 font-black">FAQ</div>
          <div className="grid divide-y divide-[#0ea5e9]/10">
            {faqs.map((faq) => <div key={faq.id} className="p-4"><strong>{faq.question}</strong><p className="text-sm text-slate-600">{faq.category ?? "ზოგადი"} / {faq.isPublished ? "published" : "hidden"}</p></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
