# linear-standup

Helps you deal with your delivery manager

A CLI tool that connects to the Linear API, checks the status of all tasks assigned to you that have changed in the last 24 hours, and generates a human-readable standup update using AI that you can paste into Slack.

## Features

- 🔗 Connects to Linear API to fetch your tasks
- 📅 Shows tasks updated in the last 24 hours (configurable)
- 🤖 Uses OpenAI to generate conversational standup updates
- 📝 Categorizes tasks: Done, In Review, In Progress
- 💬 Writes in simple, product-manager-friendly language
- 📋 Ready to copy-paste into Slack

## Installation

1. Clone this repository:
```bash
git clone https://github.com/radiodario/linear-standup.git
cd linear-standup
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Add your API keys to the `.env` file:
   - **LINEAR_API_KEY**: Get yours from [Linear Settings > API](https://linear.app/settings/api)
   - **OPENAI_API_KEY**: Get yours from [OpenAI Platform](https://platform.openai.com/api-keys)

## Usage

### Development mode:
```bash
npm run dev
```

### Build and run:
```bash
npm run build
npm start
```

### After building, you can also run directly:
```bash
./dist/index.js
```

## Configuration

All configuration is done via environment variables in the `.env` file:

- `LINEAR_API_KEY` (required): Your Linear API key
- `OPENAI_API_KEY` (required): Your OpenAI API key
- `LINEAR_VIEW_URL` (optional): Link to a specific Linear view to include in the output
- `HOURS_LOOKBACK` (optional): Number of hours to look back (default: 24)

## Example Output

```
🔍 Fetching your Linear tasks from the last 24 hours...

📋 Found 5 updated task(s):
   ✅ Done: 2
   👀 In Review: 1
   🚧 In Progress: 2

✨ Generating standup text with AI...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📢 Your Standup Update (ready to paste into Slack):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hey team! Yesterday I wrapped up the user authentication flow and fixed 
that pesky bug in the payment processing. Currently have the new dashboard 
design in review waiting for feedback, and I'm actively working on the 
mobile responsive layout and the email notification system. Making good 
progress overall!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## How It Works

1. Fetches all tasks assigned to you from Linear that were updated in the last 24 hours
2. Categorizes them by status (Done, In Review, In Progress)
3. Sends the task list to OpenAI with a prompt optimized for generating friendly, conversational standup updates
4. Displays the generated text ready to copy-paste into Slack

## License

See [LICENSE](LICENSE) file for details.

