import { Button } from "@repo/ui/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-extrabold tracking-tight">Code Reviewer</h1>
      <p className="text-muted-foreground">Welcome to the code reviewer application built with Turborepo, Next.js, and Shadcn UI.</p>
      <div className="flex gap-2">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </div>
  );
}
