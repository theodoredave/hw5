
import Sidebar from "./_components/Sidebar"; // Import Sidebar

type Props = {
  children: React.ReactNode;
};

function DocsLayout({ children}: Props) {
  return (
    // overflow-hidden for parent to hide scrollbar
    <main className="flex-rows fixed top-0 flex h-screen w-full overflow-hidden bg-gray-200">
      {/* overflow-y-scroll for child to show scrollbar */}
      <nav className="flex w-3/5 overflow-y-scroll border-r bg-slate-100 ">
        <Sidebar />
      </nav>
      {children}
    </main>
  );
}

export default DocsLayout;
