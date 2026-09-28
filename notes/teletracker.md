# TeleTracker — Telegram collection, explained simply

> TeleTracker is a small Python toolkit for authorized Telegram investigations. It can ask a Telegram bot for information, monitor new updates, and use Pyrogram to collect message records and attached media. Use it only for chats, bots, and data that you are legally authorized to examine.

![Redacted example of a TeleTracker terminal run](/notes/files/teletracker-output-redacted.svg)

*Illustrative redacted output. Real bot tokens, API values, chat IDs, user IDs, session files, and victim data must never be published.*

## The short version

Think of TeleTracker as three small tools connected together:

```text
Bot token + chat ID
          |
          v
   TeleGatherer.py  -----> Telegram Bot API
          |
          +---- monitor new updates
          +---- show bot/chat information
          +---- start message collection
                         |
                         v
                   TeleViewer.py
                         |
                         +---- Pyrogram + API_ID/API_HASH
                         +---- save text/log records
                         +---- download attached media

TeleTexter.py is the small message-sending helper used by the original project.
```

## What each file does

### `TeleGatherer.py`

This is the menu-driven main program. It uses the Telegram **Bot API** through `requests`.

It can:

- call `getMe` to identify the bot;
- call `getChat`, `getChatAdministrators`, and related methods for chat information;
- poll `getUpdates` for new updates when the bot has access;
- start the viewer/collector;
- send files or messages in the original version;
- delete messages or repeatedly send messages in the original version.

The last two disruption features are dangerous and should not be used against chats without explicit authorization. The GUI version made for this project intentionally leaves those features out.

### `TeleViewer.py`

This is the collection part. It uses **Pyrogram**, which is a Python client for Telegram's MTProto API.

It retrieves message records by message ID, newest first, and can save message IDs, dates, sender information, text, reply markup, text logs, serialized message records, and attached documents, photos, videos, audio, voice messages, and other media Telegram exposes as message media.

The GUI's **Select all messages** mode scans downward from the latest message ID. Telegram bots cannot call `messages.GetHistory`, so this mode uses individual `get_messages` requests instead. To find an upper ID, the current compatibility behavior briefly sends and deletes a dot in the authorized chat—the same approach used by the original script.

### `TeleTexter.py`

This helper sends one Telegram message. The original project also has a continuous-send mode. Treat that mode as a controlled lab feature only; it can violate Telegram rules and disturb other users.

## What is `.env`?

`.env` is a small local configuration file. It keeps Telegram application settings out of the Python source code.

```dotenv
API_ID="12345678"
API_HASH="your-telegram-api-hash"
```

`API_ID` is the numeric identifier for your Telegram application. `API_HASH` is the application hash paired with it. Together, these values tell Pyrogram which Telegram application is making the client connection.

They are **not** your username, bot token, phone number, or login code. They do not independently log in to your Telegram account. Keep them private, especially alongside session files or other credentials.

## How to get `API_ID` and `API_HASH`

1. Open Telegram's official [my.telegram.org](https://my.telegram.org/) website.
2. Sign in with a Telegram account you control.
3. Open **API development tools**.
4. Create an application if needed.
5. Copy **App api_id** into `API_ID`.
6. Copy **App api_hash** into `API_HASH`.
7. Save both values in `.env` beside the script or GUI executable.

The GUI can edit these two values, mask them by default, reveal them with its checkbox, and save the `.env` file. Do not commit that file to GitHub.

## Bot token versus API values

| Value | Used by | What it identifies |
|---|---|---|
| Bot token | Telegram Bot API | A specific bot |
| `API_ID` | Pyrogram/MTProto | A Telegram application |
| `API_HASH` | Pyrogram/MTProto | The same Telegram application |
| `.session` file | Pyrogram | A previously authenticated client session |

A bot token is much more immediately powerful: anyone holding it may be able to operate that bot within its permissions. Never publish bot tokens or Pyrogram session files. If a token is exposed, revoke it with `@BotFather`.

## Does “all messages” really mean all?

No collection tool can promise that every visible Telegram object will be recovered. TeleTracker can scan the message-ID range it is given and collect messages that the bot/client is allowed to access. Limitations include:

- deleted messages cannot be recovered;
- private or restricted content may be unavailable;
- gaps in message IDs are normal;
- bot permissions affect what can be read;
- Telegram secret chats are not ordinary cloud-chat history;
- Telegram interface icons, reactions, and many custom UI elements are metadata, not separate downloadable files;
- attached media can be downloaded when Telegram exposes it as message media;
- channel/profile avatars are not automatically the same thing as message media.

For evidence work, preserve original files, record collection time, calculate hashes, and keep a chain-of-custody record. The original TeleTracker logs are useful working notes, but are not by themselves a complete forensic evidence format.

## Case note about the reported phishing source

According to the case report provided for this note, the bot token was obtained from a website that cannot be publicly identified for confidentiality reasons. The report says that a phishing email forwarded victims' data to a Telegram bot, and that the authorized investigation used TeleTracker to review the leaked data and notify affected users.

That paragraph records the reported case context; it is not an independent claim that this website or phishing flow has been publicly verified. Do not publish the source, victim data, bot token, API values, or screenshots containing recoverable secrets.

## Safe operating checklist

1. Use a dedicated investigation bot and authorized chat.
2. Keep `.env`, `.bot-history`, `sessions/`, logs, and downloads private.
3. Redact tokens, hashes, phone numbers, user IDs, usernames, URLs, and message contents before sharing screenshots.
4. Prefer read-only collection and monitoring.
5. Do not use spam or deletion features outside a controlled, authorized test.
6. Revoke any token that appears in a public issue, screenshot, terminal history, or chat.

