import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="text-4xl font-bold text-center text-green-500 mt-20">
      <div>Hello, Next.js!</div>
      <Button variant="outline" size="default">
        Click Me
      </Button>
    </div>
  );
}
