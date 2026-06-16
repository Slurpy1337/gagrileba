import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGel(value: number | string | { toString(): string }) {
  return `${Number(value).toLocaleString("ka-GE", { maximumFractionDigits: 0 })} ₾`;
}

export function monthly(value: number | string | { toString(): string }, months = 12) {
  return Math.ceil(Number(value) / months);
}

const georgianToLatin: Record<string, string> = {
  "\u10d0": "a",
  "\u10d1": "b",
  "\u10d2": "g",
  "\u10d3": "d",
  "\u10d4": "e",
  "\u10d5": "v",
  "\u10d6": "z",
  "\u10d7": "t",
  "\u10d8": "i",
  "\u10d9": "k",
  "\u10da": "l",
  "\u10db": "m",
  "\u10dc": "n",
  "\u10dd": "o",
  "\u10de": "p",
  "\u10df": "zh",
  "\u10e0": "r",
  "\u10e1": "s",
  "\u10e2": "t",
  "\u10e3": "u",
  "\u10e4": "p",
  "\u10e5": "k",
  "\u10e6": "gh",
  "\u10e7": "q",
  "\u10e8": "sh",
  "\u10e9": "ch",
  "\u10ea": "ts",
  "\u10eb": "dz",
  "\u10ec": "ts",
  "\u10ed": "ch",
  "\u10ee": "kh",
  "\u10ef": "j",
  "\u10f0": "h",
};

function transliterateGeorgian(input: string) {
  return input.replace(/[\u10d0-\u10f0]/g, (letter) => georgianToLatin[letter] ?? letter);
}

export function slugify(input: string) {
  return transliterateGeorgian(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
