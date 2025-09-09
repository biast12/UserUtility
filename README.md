# 🔧 UserUtility Bot

**Transform your Discord experience with the most comprehensive user utility bot available!**

UserUtility is the ultimate Discord utility bot providing essential information and conversion tools. Whether you're looking up details, converting data formats, or accessing Discord's hidden information, UserUtility transforms complex tasks into simple commands that enhance your Discord experience.

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
- Developer-friendly with technical details and API information

---

## 🎯 Core Features

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
- Discord embed color codes
- Role color decimal values
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

- Check domains against Discord bad-domains endpoint

---

## 🎉 Get Started

### **Option 1: Invite the Bot (Recommended)**

### **[📥 Invite UserUtility to Your Server](https://discord.com/oauth2/authorize?client_id=1390752371998457947)**

*Ready to use in seconds - no setup required!*

---

### **Option 2: Self-Hosting**

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
   - Copy `.env.example` to `.env` and fill in your bot token

   ```env
   BOT_TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id
   ```

4. **Register the slash commands:**

   ```bash
   npm run register
   ```

5. **Start the bot:**

   ```bash
   npm run start
   ```

---

## 📞 Need Help?

**Got questions? Have a feature requests? Found an issue?**

Then please join our [support server](https://biast12.com/botsupport)
