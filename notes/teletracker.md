# TeleTracker, in one simple story

Imagine a Telegram bot as a guarded door.

- The **bot token** is the door's key.
- The **chat ID** tells the key which room to visit.
- `API_ID` and `API_HASH` identify the software using Telegram's client system.
- Pyrogram is the messenger that asks for message records.
- TeleTracker is the clipboard and camera that records what the authorized investigation can see.

![Redacted TeleTracker terminal example](/notes/files/teletracker-output-redacted.svg)

The images on this page are redacted demonstrations. They contain no real token, API value, victim data, username, or private message.

## The whole process

```text
1. Enter bot token + chat ID
              |
              v
2. Bot API checks the bot's permissions
              |
              v
3. TeleGatherer asks for chat information or new updates
              |
              v
4. TeleViewer asks Telegram for message IDs one at a time
              |
              v
5. Text is logged; attached media is downloaded
              |
              v
6. Files are saved locally in Downloads/
```

## The bot is the door

`TeleGatherer.py` sends HTTPS requests to Telegram's Bot API, such as:

```text
https://api.telegram.org/bot<TOKEN>/getMe
https://api.telegram.org/bot<TOKEN>/getChat
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Telegram checks whether the bot can see the requested chat. A bot cannot magically see every Telegram conversation. The bot token is a credential for one bot, so never put a real token in a screenshot or public repository.

## Retrieving messages

`getUpdates` is mainly for new updates. For older messages, the GUI uses Pyrogram and requests individual message IDs with `get_messages`:

```text
latest ID → latest ID - 1 → latest ID - 2 → ... → ID 1
```

Telegram bots cannot use the MTProto `messages.GetHistory` method. That is why TeleTracker walks through message IDs one at a time. Empty IDs are skipped because IDs can have gaps or messages may have been deleted.

To find the newest ID, this compatibility path briefly sends a dot and deletes it in the authorized chat—the same method used by the original script. That is why a tiny temporary message may appear during a full collection.

For each available message, TeleTracker can save the ID, date, sender details when supplied, text, reply markup, readable logs, serialized records, and attached documents, photos, videos, audio, voice messages, stickers, and other media exposed by Telegram.

## The three Python files

### `TeleGatherer.py` — the receptionist

Talks to the Bot API, shows bot/chat information, monitors new updates, and starts collection.

### `TeleViewer.py` — the archivist

Uses Pyrogram to request message records and download attached media.

### `TeleTexter.py` — the loudspeaker

Sends a message through the bot. The original project also has continuous sending. Use that only in a controlled authorized test; the GUI does not expose it.

## What is `.env`?

`.env` is the application's private settings card:

```dotenv
API_ID="12345678"
API_HASH="your-telegram-api-hash"
```

![Redacted `.env` example](/notes/files/teletracker-env-redacted.svg)

`API_ID` is a number identifying your Telegram application. `API_HASH` is the hash paired with that ID. Together they tell Pyrogram which Telegram application is connecting.

They are not your username, bot token, phone number, or login code. They do not independently open your account, but keep them private.

### Getting the values

1. Open [my.telegram.org](https://my.telegram.org/).
2. Sign in with an account you control.
3. Choose **API development tools**.
4. Create an application.
5. Copy **App api_id** into `API_ID`.
6. Copy **App api_hash** into `API_HASH`.
7. Save `.env` beside the script or `TeleTrackerGUI.exe`.

The GUI hides these values by default, has a **Show values** checkbox, and can save `.env` beside the executable.

## Does “all messages” mean literally everything?

No. It means all available message IDs in the scanned range that the authorized bot/client can read.

It cannot recover deleted messages, inaccessible private content, or secret-chat history. Telegram interface icons, reactions, and many custom UI elements are metadata—not separate downloadable files. Attached media can be downloaded when Telegram exposes it as message media. Channel/profile avatars are not automatically message attachments.

## Reported case context

According to the case report supplied for this note, the bot token came from a website that cannot be publicly identified for confidentiality reasons. The report says a phishing email forwarded victims' data to a Telegram bot, and that the authorized investigation used TeleTracker to review the leaked data and notify affected users.

This is reported case context, not an independently verified public finding. Do not publish the source, token, API values, session files, victim data, or unredacted screenshots.

## Keep the door secure

- Never publish bot tokens, `.env`, `.bot-history`, or `.session` files.
- Redact chat IDs, user IDs, usernames, URLs, message text, and filenames.
- Use the tool only on data and chats you are authorized to examine.
- Keep original evidence separate and record collection time and hashes.
- Revoke a bot token immediately if it appears in a public place.

