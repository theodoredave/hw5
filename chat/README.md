# Run the project

1. Install dependencies
   ```bash
   yarn
   ```
2. Get Pusher credentials
   Please refer to the [Pusher Setup](#pusher-setup) section for more details.

3. Get Github OAuth credentials
   Please refer to the [NextAuth Setup](#nextauth-setup) section for more details.

4. Create `.env.local` file in the project root and add the following content:

   ```text
   PUSHER_ID=
   NEXT_PUBLIC_PUSHER_KEY=
   PUSHER_SECRET=
   NEXT_PUBLIC_PUSHER_CLUSTER=

   AUTH_SECRET=<this can be any random string>
   AUTH_GITHUB_ID=
   AUTH_GITHUB_SECRET=
   ```

5. Start the database
   ```bash
   docker compose up -d
   ```
6. Run migrations
   ```bash
   yarn migrate
   ```
7. Start the development server
   ```bash
   yarn dev
   ```
8. Open http://localhost:3000 in your browser


# Caution
Please check the .env.example file since I added NEXT_PUBLIC_SOCKET_URL so you need to add it into your .env.local.
A few things you may encounter:
1. Search can only be used in homepage, meaning you can't use it when you are in a chatroom.
2. You might need to refresh after choosing a message to announce.
3. You can't unsend the opposition's messages as it supposed to work in chat applications although I left it available for display. (Right click on the message you choose in order to display announce, delete, and unsend.)
4. The last message might be displayed on the input when you switch users. Sorry but please just erase it.

# Perfect
For perfect requirements, I implemented
1. **傳送連結**：自動辨識訊息中文字是否為連結。若是連結，則可以透過該連結開啟新視窗。
2. **自動滾動**：當出現新訊息時，聊天紀錄需自動滾動至最下方。