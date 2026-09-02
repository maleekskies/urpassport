import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in or create an account for your passport status, visa documents, flights and itinerary.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
