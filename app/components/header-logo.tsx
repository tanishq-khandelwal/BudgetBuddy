import Link from "next/link";
import Image from "next/image";

export const HeaderLogo = () => {
  return (
    <Link href="/">
      <div className="hidden lg:flex items-center gap-4 ">
        <Image
          src='/logo.svg'
          alt="Budget Buddy Logo"
          width={50}
          height={50}
        />
        <h1 className="text-2xl font-bold text-white">Budget Buddy</h1>
      </div>
    </Link>
  );
};
