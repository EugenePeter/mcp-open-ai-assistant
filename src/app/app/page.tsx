import Image from "next/image";
import styles from "./page.module.css";
import { askOpenAI } from "@/app/actions/ai-assistant";
export default function Home() {
  return (
    <div className="bg-blue-500">
      asffdfs
      <h1>hello there</h1>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold text-blue-600">
          Tailwind CSS is working asdfsfsd! 🎉
        </h1>
      </div>
    </div>
  );
}
