#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { fetchRecentTasks, fetchAllUsersRecentTasks } from "./linear-client.js";
import { generateStandupText, generateTeamStandupText } from "./llm-client.js";

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const allMode = args.includes("--all");

    // Validate required environment variables
    const linearApiKey = process.env.LINEAR_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!linearApiKey) {
      console.error("❌ Error: LINEAR_API_KEY is required");
      console.error("Please set it in your .env file or environment variables");
      console.error("See .env.example for more details");
      process.exit(1);
    }

    if (!openaiApiKey) {
      console.error("❌ Error: OPENAI_API_KEY is required");
      console.error("Please set it in your .env file or environment variables");
      console.error("See .env.example for more details");
      process.exit(1);
    }

    // Optional configuration
    const viewUrl = process.env.LINEAR_VIEW_URL;
    const hoursLookback = parseInt(process.env.HOURS_LOOKBACK || "24", 10);

    if (allMode) {
      await handleAllMode(linearApiKey, openaiApiKey, hoursLookback, viewUrl);
    } else {
      await handleSingleUserMode(
        linearApiKey,
        openaiApiKey,
        hoursLookback,
        viewUrl
      );
    }
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

async function handleSingleUserMode(
  linearApiKey: string,
  openaiApiKey: string,
  hoursLookback: number,
  viewUrl?: string
) {
  console.log("🔍 Fetching your Linear tasks from the last 24 hours...\n");

  // Fetch tasks from Linear
  const tasks = await fetchRecentTasks(linearApiKey, hoursLookback);

  // Count total tasks
  const totalTasks =
    tasks.done.length +
    tasks.inReview.length +
    tasks.inProgress.length +
    tasks.other.length;

  if (totalTasks === 0) {
    console.log("ℹ️  No tasks were updated in the last 24 hours.");
    return;
  }

  console.log(`📋 Found ${totalTasks} updated task(s):`);
  console.log(`   ✅ Done: ${tasks.done.length}`);
  tasks.done.forEach((task) => {
    console.log(`      - ${task.title}`);
    console.log(`        ${task.url}`);
  });
  console.log(`   👀 In Review: ${tasks.inReview.length}`);
  tasks.inReview.forEach((task) => {
    console.log(`      - ${task.title}`);
    console.log(`        ${task.url}`);
  });
  console.log(`   🚧 In Progress: ${tasks.inProgress.length}`);
  tasks.inProgress.forEach((task) => {
    console.log(`      - ${task.title}`);
    console.log(`        ${task.url}`);
  });
  if (tasks.other.length > 0) {
    console.log(`   📝 Other: ${tasks.other.length}`);
    tasks.other.forEach((task) => {
      console.log(`      - ${task.title}`);
      console.log(`        ${task.url}`);
    });
  }
  console.log();

  console.log("✨ Generating standup text with AI...\n");

  // Generate the standup text
  const standupText = await generateStandupText(tasks, openaiApiKey, viewUrl);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📢 Your Standup Update (ready to paste into Slack):");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log();
  console.log(standupText);
  console.log();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

async function handleAllMode(
  linearApiKey: string,
  openaiApiKey: string,
  hoursLookback: number,
  viewUrl?: string
) {
  console.log(
    "🔍 Fetching Linear tasks for all team members from the last 24 hours...\n"
  );

  // Fetch tasks for all users
  const allUserTasks = await fetchAllUsersRecentTasks(
    linearApiKey,
    hoursLookback
  );

  if (allUserTasks.length === 0) {
    console.log(
      "ℹ️  No tasks were updated by any team member in the last 24 hours."
    );
    return;
  }

  console.log(`📋 Found tasks from ${allUserTasks.length} team member(s):\n`);

  // Print debug output for each user
  for (const userTasks of allUserTasks) {
    const totalTasks =
      userTasks.tasks.done.length +
      userTasks.tasks.inReview.length +
      userTasks.tasks.inProgress.length +
      userTasks.tasks.other.length;

    console.log(`👤 ${userTasks.userName} - ${totalTasks} task(s):`);

    if (userTasks.tasks.done.length > 0) {
      console.log(`   ✅ Done: ${userTasks.tasks.done.length}`);
      userTasks.tasks.done.forEach((task) => {
        console.log(`      - ${task.title}`);
        console.log(`        ${task.url}`);
      });
    }

    if (userTasks.tasks.inReview.length > 0) {
      console.log(`   👀 In Review: ${userTasks.tasks.inReview.length}`);
      userTasks.tasks.inReview.forEach((task) => {
        console.log(`      - ${task.title}`);
        console.log(`        ${task.url}`);
      });
    }

    if (userTasks.tasks.inProgress.length > 0) {
      console.log(`   🚧 In Progress: ${userTasks.tasks.inProgress.length}`);
      userTasks.tasks.inProgress.forEach((task) => {
        console.log(`      - ${task.title}`);
        console.log(`        ${task.url}`);
      });
    }

    if (userTasks.tasks.other.length > 0) {
      console.log(`   📝 Other: ${userTasks.tasks.other.length}`);
      userTasks.tasks.other.forEach((task) => {
        console.log(`      - ${task.title}`);
        console.log(`        ${task.url}`);
      });
    }

    console.log();
  }

  console.log("✨ Generating team standup text with AI...\n");

  // Generate the team standup text
  const standupText = await generateTeamStandupText(
    allUserTasks,
    openaiApiKey,
    viewUrl
  );

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📢 Team Standup Update (ready to paste into Slack):");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log();
  console.log(standupText);
  console.log();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main();
