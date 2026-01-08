import OpenAI from 'openai';
import type { CategorizedTasks } from './linear-client.js';

export async function generateStandupText(
  tasks: CategorizedTasks,
  apiKey: string,
  viewUrl?: string
): Promise<string> {
  const openai = new OpenAI({ apiKey });

  // Build the prompt with task information
  const prompt = buildPrompt(tasks, viewUrl);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that writes standup updates in a friendly, conversational style. 
Your updates should be easy to understand for product managers and non-technical stakeholders. 
Use simple language, avoid jargon, and focus on the impact and progress of the work.
Keep the tone professional but casual, like you're updating a colleague over coffee.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || 'Unable to generate standup text.';
}

function buildPrompt(tasks: CategorizedTasks, viewUrl?: string): string {
  let prompt = `Please write a brief standup update based on these tasks from the last 24 hours:\n\n`;

  if (tasks.done.length > 0) {
    prompt += `**Completed:**\n`;
    tasks.done.forEach(task => {
      prompt += `- ${task.title}\n`;
    });
    prompt += `\n`;
  }

  if (tasks.inReview.length > 0) {
    prompt += `**In Review:**\n`;
    tasks.inReview.forEach(task => {
      prompt += `- ${task.title}\n`;
    });
    prompt += `\n`;
  }

  if (tasks.inProgress.length > 0) {
    prompt += `**In Progress:**\n`;
    tasks.inProgress.forEach(task => {
      prompt += `- ${task.title}\n`;
    });
    prompt += `\n`;
  }

  if (tasks.other.length > 0) {
    prompt += `**Other Updates:**\n`;
    tasks.other.forEach(task => {
      prompt += `- ${task.title} (${task.status})\n`;
    });
    prompt += `\n`;
  }

  if (tasks.done.length === 0 && tasks.inReview.length === 0 && 
      tasks.inProgress.length === 0 && tasks.other.length === 0) {
    prompt += `No tasks were updated in the last 24 hours.\n\n`;
  }

  prompt += `Write this as a single, natural-sounding paragraph that I can paste into Slack. `;
  prompt += `Make it sound human and conversational, not like a list. `;
  prompt += `Focus on what was accomplished and what's happening next.`;

  if (viewUrl) {
    prompt += ` Include this link at the end if relevant: ${viewUrl}`;
  }

  return prompt;
}
