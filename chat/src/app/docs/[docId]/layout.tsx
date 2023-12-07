import Navbar from "../_components/Navbar";

type Props = {
  children: React.ReactNode;
  params: { docId: string };
};

function DocEditorLayout({ children }: Props) {
  return (
    <>
    <nav className="flex w-4/5 flex-col overflow-y-scroll border-r bg-slate-100 pb-10">
      <Navbar searchParams=''/>
    </nav>    
    <div className="w-full overflow-y-scroll">

    <div className="w-full h-full">
      <div className="fixed right-2 top-1 z-50">
        {/* <ShareDialog docId={params.docId} /> */}
      </div>
      {children}
    </div>
    </div>
    </>

  );
}

export default DocEditorLayout;
