
import Image from "next/image";
import Navbar from "./_components/Navbar";

type Props = {
  searchParams: 
  {search?:string;
  };
}
function DocsPage({ searchParams }: Props) {
  let { search } = searchParams;
  if (!search){
    search = ''
  }
  return (
  <>
    <nav className="flex w-4/5 flex-col overflow-y-scroll border-r bg-slate-100 pb-10">
      <Navbar searchParams={search}/>
    </nav>
  {/* overflow-y-scroll for child to show scrollbar */}
    <div className="w-full overflow-y-scroll">
      <div className="flex h-[90vh] w-full items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <Image src="/chaticon.png" alt="Lime Image" width={100} height={100} />
          <p className="text-sm font-semibold text-slate-700">
            Communicate with user you want
          </p>
        </div>
      </div>
    </div>   
  </>
  );
}
export default DocsPage;
