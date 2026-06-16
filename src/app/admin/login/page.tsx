"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
    });
    if (res.ok) router.push("/admin");
    else setError("Email or password is incorrect.");
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <Card className="p-6">
        <h1 className="text-2xl font-black">Admin Login</h1>
        <form action={submit} className="mt-5 grid gap-3">
          <input name="email" type="email" placeholder="admin@gagrileba.ge" className="h-11 rounded-md border px-3" />
          <input name="password" type="password" placeholder="Password" className="h-11 rounded-md border px-3" />
          <Button>Log in</Button>
        </form>
        {error ? <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p> : null}
      </Card>
    </div>
  );
}
