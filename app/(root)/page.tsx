import Image from "next/image";
import { Button } from "@/components/ui/button";
import { main } from "ts-node/dist/bin";
export default function Home() {
  return (
    <main>
      <h1>Home page!</h1>
      <Button>Click to Sign in</Button>
    </main>
  );
}
