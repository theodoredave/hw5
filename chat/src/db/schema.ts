import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  index,
  text,
  pgTable,
  serial,
  uuid,
  varchar,
  unique,
  timestamp,
} from "drizzle-orm/pg-core";


export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    username: varchar("username", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    hashedPassword: varchar("hashed_password", { length: 100 }),
    provider: varchar("provider", {
      length: 100,
      enum: ["github", "credentials"],
    })
      .notNull()
      .default("credentials"),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
    emailIndex: index("email_index").on(table.email),
  }),
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  usersToDocumentsTable: many(usersToDocumentsTable),
  MessagesTable: many(messagesTable)
}));

export const documentsTable = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    title: varchar("title", { length: 100 }).notNull(),
    content: text("content").notNull(),
    announceId: uuid("announceId"),
    lastChanged: timestamp("lastChanged").default(sql`now()`),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
  }),
);

export const documentsRelations = relations(documentsTable, ({ many }) => ({
  usersToDocumentsTable: many(usersToDocumentsTable),
  MessagesTable: many(messagesTable),
}));

export const usersToDocumentsTable = pgTable(
  "users_to_documents",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.displayId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documentsTable.displayId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    user2Id: uuid("user2_id").notNull(),
  },
  (table) => ({
    userAndDocumentIndex: index("user_and_document_index").on(
      table.userId,
      table.documentId,
    ),
    // This is a unique constraint on the combination of userId and documentId.
    // This ensures that there is no duplicate entry in the table.
    uniqCombination: unique().on(table.documentId, table.userId),
  }),
);

export const usersToDocumentsRelations = relations(
  usersToDocumentsTable,
  ({ one }) => ({
    document: one(documentsTable, {
      fields: [usersToDocumentsTable.documentId],
      references: [documentsTable.displayId],
    }),
    user: one(usersTable, {
      fields: [usersToDocumentsTable.userId],
      references: [usersTable.displayId],
    }),
  }),
);

export const messagesTable = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    userId: uuid("user_id")
    .references(()=> usersTable.displayId,{
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    documentId: uuid("doc_id").notNull()
    .references(()=> documentsTable.displayId,{
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    content: text("content").notNull(),
    deleteFor: uuid("delete_for"),
    createdAt: timestamp("created_at").default(sql`now()`),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
    userIndex: index("user_index").on(table.userId),
    documentIndex: index("document_index").on(table.documentId),
  }),
);

export const messagesRelation = relations(messagesTable, ({one}) => ({
  // userTable: one(usersTable),
  usersTable: one(usersTable, {
    fields: [messagesTable.userId],
    references: [usersTable.displayId],
  }),

  documentsTable: one(documentsTable, {
    fields: [messagesTable.documentId],
    references: [documentsTable.displayId],
  }),

})
)
