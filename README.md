# 🔧 UserUtility Bot

**Transform your Discord experience with the most comprehensive user utility bot available!**

UserUtility is the ultimate Discord utility bot providing essential information and conversion tools. Whether you're looking up details, converting data formats, or accessing Discord's hidden information, UserUtility transforms complex tasks into simple commands that enhance your Discord experience.

> **User App** — UserUtility is installed per-user, not per-server. It works in DMs, group DMs, and any server you're in.

## ✨ Why Choose UserUtility?

### 🚀 **Instant Information Access**

- Get detailed user profiles, avatars, and banners in seconds
- Analyze Discord invites with comprehensive server insights
- Decode snowflake IDs to reveal creation dates and technical details
- Convert timestamps to Discord's native formatting

### 🎨 **Creative Tools**

- Advanced color converter with multiple formats (HEX, RGB, HSL, Discord embed colors)
- High-resolution avatar and banner downloads in multiple formats
- Visual color previews with usage examples

### 💼 **Professional Features**

- Clean, ephemeral responses that don't clutter your channels
- Modern Discord UI with rich embeds and media galleries
- Developer-friendly raw data export via context menu commands

---

## 🎯 Slash Commands

### `/check` — User utility commands

### `/test` — Developer testing tools

### 👤 **User Analysis** (`/check user`)

- Complete user profiles with usernames, global names, and IDs
- Account creation dates and age calculations
- Discord badges and verification status
- Bot detection and verification indicators
- Profile effects and collectibles information

### 🖼️ **Avatar & Banner Tools** (`/check avatar`)

- Download avatars in sizes up to 4096x4096px
- Multiple formats: PNG, JPG, WebP, and animated GIF support
- High-resolution banner downloads
- Instant preview and download links

### 🔗 **Invite Inspector** (`/check invite`)

- Detailed server information from invite codes
- Member counts and online statistics
- Server descriptions and verification levels
- Inviter information and vanity URL detection
- Expiration tracking and boost counts

### 🎨 **Color Converter** (`/check color`)

- Convert between HEX, RGB, HSL, and decimal formats
- Discord embed color codes and role color decimal values
- Color name recognition and brightness analysis
- Usage examples for developers

### ❄️ **Snowflake Decoder** (`/check snowflake`)

- Decode any Discord ID to reveal creation timestamp
- Technical breakdown with worker and process IDs
- Binary representation and increment values
- Object type identification and age calculation

### ⏰ **Timestamp Generator** (`/check timestamp`)

- Convert dates to Discord timestamp format
- All Discord timestamp styles (relative, short, long)
- Natural language parsing ("5 minutes ago", "tomorrow")
- Unix timestamp conversion

### 🛡️ **Domain Security** (`/check baddomain`)

- Check domains against Discord's bad-domains list

---

## 🧪 Test Commands

All test commands are grouped under `/test`. Responses are ephemeral — only you can see them.

### 📨 **Message Tester** (`/test message`)

Post any raw Discord message payload JSON to see exactly how it renders.

- Accepts a full message object: `content`, `embeds`, `components`, `flags`, `tts`, `allowed_mentions`, `poll`
- Supports legacy components and Components V2 — V2 types (Container, Section, TextDisplay, etc.) are auto-detected and the `IS_COMPONENTS_V2` flag is added automatically
- Supported flags: `SUPPRESS_EMBEDS` (`4`), `EPHEMERAL` (`64`), `SUPPRESS_NOTIFICATIONS` (`4096`), `IS_COMPONENTS_V2` (`32768`) — combine with bitwise OR
- Placeholders: `{{id}}` (unique ID), `{{ts}}` (Unix timestamp), `{{bot}}` (bot client ID)

**Examples:**
```json
{"content": "Hello world!"}
{"embeds": [{"title": "Test", "color": 5814783, "description": "Embed test"}]}
{"flags": 64, "embeds": [{"title": "Ephemeral embed"}]}
{"components": [{"type": 17, "components": [{"type": 10, "content": "V2 text block"}]}]}
```

### 🪟 **Modal Tester** (`/test modal`)

Trigger any raw Discord modal JSON to see how it looks and test field submission.

- Accepts a modal object: `{ title, custom_id, components }`
- Same placeholders apply (`{{id}}`, `{{ts}}`, `{{bot}}`)
- Submitting the modal echoes all field values back ephemerally so you can verify the data flow end to end

**Example:**
```json
{
  "title": "Feedback",
  "custom_id": "{{id}}",
  "components": [{
    "type": 1,
    "components": [{
      "type": 4,
      "custom_id": "{{id}}",
      "label": "Your feedback",
      "style": 2,
      "required": true
    }]
  }]
}
```

---

## 🖱️ Context Menu Commands

Right-click any message or user and select **Apps** to access these commands. All responses are ephemeral — only you can see them.

### Right-click a Message

| Command | Description | Available |
|---------|-------------|-----------|
| **Copy Message Data** | Full raw message object as a `.json` file | Everywhere |
| **Copy Author Data** | Raw user object of the message author as a `.json` file | Everywhere |

### Right-click a User

| Command | Description | Available |
|---------|-------------|-----------|
| **Copy User Data** | Full raw user object as a `.json` file | Everywhere |
| **Copy Member Data** | Raw guild member object (roles, nickname, join date, permissions) as a `.json` file | Servers only |

---

## 🎉 Get Started

### **[📥 Add UserUtility to Your Account](https://discord.com/oauth2/authorize?client_id=1390752371998457947)**

*Installs to your Discord account — works in DMs and any server you're in, no server permissions required.*

---

### Self-Hosting

If you prefer to run your own instance:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/biast12/userUtility
   cd userUtility
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up your environment variables:**

   ```env
   BOT_TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id
   ```

4. **Register commands:**

   ```bash
   npm run register
   ```

5. **Start the bot:**

   ```bash
   npm run start
   ```

---

## 📞 Need Help?

**Got questions? Have a feature request? Found an issue?**

Join the [support server](https://biast12.com/botsupport)
