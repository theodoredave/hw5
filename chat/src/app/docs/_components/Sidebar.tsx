import { RxAvatar } from "react-icons/rx";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { publicEnv } from "@/lib/env/public";

async function Sidebar() {
  const session = await auth();
  if (!session || !session?.user?.id) {
    redirect(publicEnv.NEXT_PUBLIC_BASE_URL);
  }

  return (
    <nav className="flex w-full flex-col overflow-y-scroll pb-10" style={{ backgroundColor: 'rgba(173, 216, 76, 0.5)', margin: 0, padding: 0 }}>
      {/* Logo and text at the top center */}
      <div className="flex flex-col items-center justify-center px-3 py-4">
        <Image src="/lime.png" alt="Lime Image" width={100} height={100} />
        <p className="text-sm text-gray-500 mt-2 font-sans font-bold">
          NOT LINE
        </p>
      </div>

      {/* User info at the bottom */}
      <div className="flex-grow flex flex-col justify-end">
        <div className="flex w-full items-center justify-between px-3 py-1">
          <div className="flex items-center gap-2">
            <RxAvatar />
            <h1 className="text-sm font-semibold">
              {session?.user?.username ?? "User"}
            </h1>
          </div>
          <Link href={`/auth/signout`}>
            <Button variant={"ghost"} type={"submit"} className="hover:bg-slate-200">
              Sign Out
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
