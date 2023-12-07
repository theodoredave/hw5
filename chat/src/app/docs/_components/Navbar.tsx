import { AiFillDelete} from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { publicEnv } from "@/lib/env/public";
import {  createDocument, deleteDocument, getDocuments, getDocumentAuthors, addDocumentAuthor } from "./actions";
import SearchParams from "./Search";
async function Navbar({ searchParams }: { searchParams: string | null }) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    redirect(publicEnv.NEXT_PUBLIC_BASE_URL);
  }
  const userId = session.user.id;
  searchParams = searchParams? searchParams : ""
  const documents = await getDocuments(userId, searchParams);
  

  const getTitle = async (docId: string) => {
    const authors = await getDocumentAuthors(docId);
    for (let i=0; i< authors.length; i++){
      if (authors[i].id !== userId){
        return authors[i].username;
      }
    }
    return "User not found";
  }
  const promises = documents.map(async (item) => {
    const chatName = await getTitle(item.documentId);
    return { ...item, chatName };
  });

  const extendedDocuments = await Promise.all(promises);
  
  return (
    <nav className="flex w-full flex-col overflow-y-scroll bg-slate-100 pb-10">
      <nav className="sticky top-0 flex flex-col items-center justify-between border-b bg-slate-100 pb-2 ">
        <h1 className="text-lg font-semibold text-slate-500 mb-2">Chat</h1>
        <form
          className="flex flex-row gap-4"
          action={async (e) => {
            "use server";
            const username = e.get("username")
            if (!username) return;
            if (typeof username !== "string") return;

            const newDocId = await createDocument(userId, username);
            if (!newDocId) return;
            const result = await addDocumentAuthor(newDocId, username, userId);
            console.log(userId)
            if (!result) {
              console.log("User not found")
              deleteDocument(newDocId);
              redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/docs`);
            }
            revalidatePath("/docs");
            redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/docs/${newDocId}`);
          }}
        >
          <Input placeholder="username" name="username" />
          <Button type="submit">Add</Button>
        </form>
      </nav>

      <SearchParams/>
      <section className="flex w-full flex-col pt-3">
        {extendedDocuments.length ===0 &&
        <>
          <p className="flex justify-center text-sm text-red-500">
            Chat doesn't exist, find someone!
          </p>
        <form
          className="flex flex-row gap-4"
          action={async (e) => {
            "use server";
            const username = e.get("username")
            if (!username) return;
            if (typeof username !== "string") return;

            const newDocId = await createDocument(userId, username);
            if (!newDocId) return;
            const result = await addDocumentAuthor(newDocId, username, userId);
            console.log(userId)
            if (!result) {
              console.log("User not found")
              deleteDocument(newDocId);
              redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/docs`);
            }
            revalidatePath("/docs");
            redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/docs/${newDocId}`);
          }}
        >
          <Input placeholder="username" name="username" />
          <Button type="submit">Add</Button>
        </form>
        </>
        }
        {
        extendedDocuments.map((doc, i) => {
          return (
            <div
              key={i}
              className="group flex w-full cursor-pointer items-center justify-between gap-2 text-slate-400 hover:bg-slate-200 border-black rounded p-2"
              style={{ border: "1px solid black" }} // Add border style here
            >
              <Link
                className="grow px-3 py-1 "
                href={`/docs/${doc.document.displayId}`}
              >
                <div className="flex items-center gap-2 ">
                  <RxAvatar />
                  {doc.chatName}
                </div>
                {doc.document.content}
              </Link>
              <form
                className="hidden px-2 text-slate-400 hover:text-red-400 group-hover:flex"
                action={async () => {
                  "use server";
                  const docId = doc.document.displayId;
                  await deleteDocument(docId);
                  revalidatePath("/docs");
                  redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/docs`);
                }}
              >
                <button type={"submit"}>
                  <AiFillDelete size={16} />
                </button>
              </form>
            </div>
          );
        })}
      </section>
    </nav>
  );
}

export default Navbar;