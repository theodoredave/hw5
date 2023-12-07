import { NextResponse, type NextRequest } from "next/server";

import { and, eq, asc } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { documentsTable, messagesTable, usersToDocumentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";
import { updateDocSchema } from "@/validators/updateDocument";

// GET /api/documents/:documentId
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      documentId: string;
    };
  },
) {
  try {
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Get the document
    const dbDocument = await db.query.usersToDocumentsTable.findFirst({
      where: and(
        eq(usersToDocumentsTable.userId, userId),
        eq(usersToDocumentsTable.documentId, params.documentId),
      ),
      with: {
        document: {
          columns: {
            displayId: true,
            title: true,
            content: true,
            announceId: true,
            
          },
        },
      },
    });
    if (!dbDocument?.document) {
      return NextResponse.json({ error: "Doc Not Found" }, { status: 404 });
      
    }

    const document = dbDocument.document;
    const announceId = document.announceId
    

    const dbMessages = await db
      .select({
        messageId: messagesTable.displayId,
        content: messagesTable.content,
        senderId: messagesTable.userId,
        deleteFor: messagesTable.deleteFor,
      })
      .from(messagesTable)
      .where(eq(messagesTable.documentId, params.documentId))
      .orderBy(asc(messagesTable.createdAt))
      .execute()

      let announcedMsg = null; 

      if (announceId) {
        
          const results = await db
              .select({
                  messageId: messagesTable.displayId,
                  content: messagesTable.content,
                  senderId: messagesTable.userId,
              })
              .from(messagesTable)
              .where(eq(messagesTable.displayId, announceId));
      
          if (results.length > 0) {
              announcedMsg = results[0]; 
          }
      }
    return NextResponse.json(
      {
        id: document.displayId,
        title: document.title,
        content: document.content,
        messages: dbMessages,
        announcedMsg: announcedMsg,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

// PUT /api/documents/:documentId
export async function PUT(
  req: NextRequest,
  { params }: { params: { documentId: string } },
) {
  try {
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Check ownership of document
    const [doc] = await db
      .select({
        documentId: usersToDocumentsTable.documentId,
      })
      .from(usersToDocumentsTable)
      .where(
        and(
          eq(usersToDocumentsTable.userId, userId),
          eq(usersToDocumentsTable.documentId, params.documentId),
        ),
      );
    if (!doc) {
      return NextResponse.json({ error: "Doc Not Found" }, { status: 404 });
    }

    // Parse the request body
    const { action, data } = await req.json();
    const reqBody = data;
    let validatedReqBody: Partial<Omit<Document, "id">>;
    try {
      console.log(reqBody)
      validatedReqBody = updateDocSchema.parse(reqBody);
    } catch (error) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }
    console.log(reqBody)
    // Update document
    const [updatedDoc] = await db
      .update(documentsTable)
      .set(validatedReqBody)
      .where(eq(documentsTable.displayId, params.documentId))
      .returning();
    if (action === "update"){
      console.log("Insert to database")
      const updatedMessage = await db
      .insert(messagesTable)
      .values({
        userId: userId,
        documentId:params.documentId,
        content: updatedDoc.content,
      })
      .returning()
      .execute();
      // Trigger pusher event
      const pusher = new Pusher({
        appId: privateEnv.PUSHER_ID,
        key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
        secret: privateEnv.PUSHER_SECRET,
        cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
      });
      // Private channels are in the format: private-...
      await pusher.trigger(`private-${updatedDoc.displayId}`, "doc:update", {
        senderId: userId,
        document: {
          id: updatedDoc.displayId,
          title: updatedDoc.title,
          content: updatedDoc.content,
        },
        message: {
          messageId: updatedMessage[0].displayId,
          senderId: userId,
          content: updatedDoc.content
        }
      });      
    }


    return NextResponse.json(
      {
        id: updatedDoc.displayId,
        title: updatedDoc.title,
        content: updatedDoc.content,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}