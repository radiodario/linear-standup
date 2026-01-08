#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { fetchRecentTasks } from './linear-client.js';
import { generateStandupText } from './llm-client.js';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Validate required environment variables
    const linearApiKey = process.env.LINEAR_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!linearApiKey) {
      console.error('❌ Error: LINEAR_API_KEY is required');
      console.error('Please set it in your .env file or environment variables');
      console.error('See .env.example for more details');
      process.exit(1);
    }

    if (!openaiApiKey) {
      console.error('❌ Error: OPENAI_API_KEY is required');
      console.error('Please set it in your .env file or environment variables');
      console.error('See .env.example for more details');
      process.exit(1);
    }

    // Optional configuration
    const viewUrl = process.env.LINEAR_VIEW_URL;
    const hoursLookback = parseInt(process.env.HOURS_LOOKBACK || '24', 10);

    console.log('🔍 Fetching your Linear tasks from the last 24 hours...\n');

    // Fetch tasks from Linear
    const tasks = await fetchRecentTasks(linearApiKey, hoursLookback);

    // Count total tasks
    const totalTasks = tasks.done.length + tasks.inReview.length + 
                      tasks.inProgress.length + tasks.other.length;

    if (totalTasks === 0) {
      console.log('ℹ️  No tasks were updated in the last 24 hours.');
      return;
    }

    console.log(`📋 Found ${totalTasks} updated task(s):`);
    console.log(`   ✅ Done: ${tasks.done.length}`);
    console.log(`   👀 In Review: ${tasks.inReview.length}`);
    console.log(`   🚧 In Progress: ${tasks.inProgress.length}`);
    if (tasks.other.length > 0) {
      console.log(`   📝 Other: ${tasks.other.length}`);
    }
    console.log();

    console.log('✨ Generating standup text with AI...\n');

    // Generate the standup text
    const standupText = await generateStandupText(tasks, openaiApiKey, viewUrl);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📢 Your Standup Update (ready to paste into Slack):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log();
    console.log(standupText);
    console.log();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
