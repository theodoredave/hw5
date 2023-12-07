import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import Pusher from "pusher";
import { db } from "@/db";
import { messagesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";
import { updateMessageSchema } from "@/validators/updateMessage";
import type { Message } from "@/lib/types/db";




// PUT /api/documents/:documentId
export async function PUT(
  req: NextRequest,
  { params }: { params: { messageId: string } },
) {
  try {
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    
    // Parse the request body
    const { action, data } = await req.json();
    const reqBody = data;
    let validatedReqBody: Partial<Omit<Message, "id">>;
    try {
      validatedReqBody = updateMessageSchema.parse(reqBody);
    } catch (error) {
      console.log("NotValid Message Request")
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    //Delete Message
    if (action === 'unsend'){
          const [deletedMessage] = await db
            .delete(messagesTable)
            .where(
              eq(messagesTable.displayId, params.messageId),
            ).returning()
          if (!deletedMessage) {
            return NextResponse.json({ error: "Message Not Found" }, { status: 404 });
          }
          //Trigger Pusher Event
          const pusher = new Pusher({
            appId: privateEnv.PUSHER_ID,
            key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
            secret: privateEnv.PUSHER_SECRET,
            cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
            useTLS: true,
          });
          // Private channels are in the format: private-...
          await pusher.trigger(`private-${deletedMessage.documentId}`, "msg:unsend", {
            updatedMessage: {
              messageId: deletedMessage.displayId,
              content: deletedMessage.content,
              senderId: userId,
            }
          });             
    }
    if (action === 'deleteFor'){

      const [updatedMessage] = await db
      .update(messagesTable)
      .set(validatedReqBody)
      .where(eq(messagesTable.displayId, params.messageId))
      .returning();
      if (!updatedMessage) {
        return NextResponse.json({ error: "Message Not Found" }, { status: 404 });
      }
      //Trigger Pusher Event
      const pusher = new Pusher({
        appId: privateEnv.PUSHER_ID,
        key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
        secret: privateEnv.PUSHER_SECRET,
        cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
      });
      // Private channels are in the format: private-...
      console.log("PUSHER ", updatedMessage)
      await pusher.trigger(`private-${updatedMessage.documentId}`, "msg:update", {
        updatedMessage: {
          messageId: updatedMessage.displayId,
          deleteFor: params.messageId
        }
      });           
    }


    return NextResponse.json(
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