import { eq, and, inArray} from "drizzle-orm";
import { db } from "@/db";
import { usersTable, documentsTable, usersToDocumentsTable } from "@/db/schema";

export const createDocument = async (userId: string, username: string) => {
  "use server";
  console.log("[createDocument]");
 
  const [user2] = await db
    .select({
      displayId: usersTable.displayId,
      username: usersTable.username,
    })
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (!user2) {
    return false;
  }  
  const newDocId = await db.transaction(async (tx) => {
    const currentUser = await tx
    .select({
      username: usersTable.username,
    })
    .from(usersTable)
    .where(eq(usersTable.displayId, userId))
    .limit(1);

    const [newDoc] = await tx
      .insert(documentsTable)
      .values({
        title: `${username} and ${currentUser[0]?.username || "Unknown User"}`,
        content: "",
      })
      .returning();
    await tx.insert(usersToDocumentsTable).values({
      userId: userId,
      documentId: newDoc.displayId,
      user2Id: user2.displayId,
    });
    return newDoc.displayId;
  });
  return newDocId;
};

export const getDocuments = async (userId: string, searchParams:string) => {
  "use server";

  const documents = await db.query.usersToDocumentsTable.findMany({
    where: eq(usersToDocumentsTable.userId, userId),
    with: {
      document: {
        columns: {
          displayId: true,
          title: true,
          content:true,
          lastChanged:true,

        },
      },
      
    },
  });
  documents.sort((a, b) => {
    // Handle cases where lastChanged might be null
    if (a.document.lastChanged === null) return 1; // Move a to the end if lastChanged is null
    if (b.document.lastChanged === null) return -1; // Move b to the end if lastChanged is null
  
    // If both are not null, compare normally
    return  new Date(a.document.lastChanged).getTime() - new Date(b.document.lastChanged).getTime() ;
  });

  const updateDocuments = async () => {
    for (const doc of documents) {
      const chatUserId = doc.userId === userId ? doc.user2Id : doc.userId;
      const [user1] = await db
        .select({
          username: usersTable.username
        })
        .from(usersTable)
        .where(eq(usersTable.displayId, chatUserId));
  
      if (user1) {
        doc.document.title = user1.username;
      }
    }
  };
  const updateAndFilterDocuments = async() =>{
    await updateDocuments()
    console.log(documents)
    return documents.filter(doc =>{
      return doc.document.title.toLowerCase().includes(searchParams)
    })
  }

  const filteredDocuments = await updateAndFilterDocuments()
    console.log('searched: ', searchParams, 'filtered: ', filteredDocuments)    
  return filteredDocuments;
  
};
export const deleteDocument = async (documentId: string) => {
  "use server";
  console.log("[deleteDocument]");
  await db
    .delete(documentsTable)
    .where(eq(documentsTable.displayId, documentId));
  return;
};

export async function getDocumentAuthors(docId: string) {
  const dbAuthors = await db.query.usersToDocumentsTable.findMany({
    where: eq(usersToDocumentsTable.documentId, docId),
    with: {
      user: {
        columns: {
          displayId: true,
          username: true,
          email: true,
        },
      },
    },
    columns: {},
  });

  const authors = dbAuthors.map((dbAuthor) => {
    const author = dbAuthor.user;
    return {
      id: author.displayId,
      username: author.username,
      email: author.email,
    };
  });

  return authors;
}

export const addDocumentAuthor = async (docId: string, username: string, authorId:string) => {
  const [user] = await db
    .select({
      displayId: usersTable.displayId,
    })
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (!user) {
    return false;
  }

  const userDoc = await db
    .select({
      docId: usersToDocumentsTable.documentId
    })
    .from(usersToDocumentsTable)
    .where(eq(usersToDocumentsTable.userId, user.displayId))
  if (userDoc){
    const userDocIds = userDoc.map(doc => doc.docId)
    if (userDocIds.length !== 0){
  
      const sharedDoc = await db
      .select({
        docId: usersToDocumentsTable.documentId
      })
      .from(usersToDocumentsTable)
      .where(and(
        eq(usersToDocumentsTable.userId, authorId)
        ))
        
      const sharedDocIds = sharedDoc.map(doc => doc.docId);

      if (sharedDocIds){
        const docUser = await db
        .select({
          userId: usersToDocumentsTable.userId
        })
        .from(usersToDocumentsTable)
        .where(and(
          inArray(usersToDocumentsTable.documentId, sharedDocIds)
        ))
  
        const userIds = docUser.map(user => user.userId);
        if (userIds.includes(user.displayId)) {
          console.log("User already Exists", user.displayId)
          return false;
        }

      }

    }
  }
  await db.insert(usersToDocumentsTable).values({
    documentId: docId,
    userId: user.displayId,
    user2Id: authorId,

  });

  return true;
};