import { LinearClient } from '@linear/sdk';

export interface TaskInfo {
  id: string;
  title: string;
  status: string;
  url: string;
  updatedAt: Date;
}

export interface CategorizedTasks {
  done: TaskInfo[];
  inReview: TaskInfo[];
  inProgress: TaskInfo[];
  other: TaskInfo[];
}

export async function fetchRecentTasks(
  apiKey: string,
  hoursLookback: number = 24
): Promise<CategorizedTasks> {
  const client = new LinearClient({ apiKey });

  // Calculate the date threshold
  const lookbackDate = new Date();
  lookbackDate.setHours(lookbackDate.getHours() - hoursLookback);

  // Get the current user
  const viewer = await client.viewer;
  
  // Fetch issues assigned to the current user
  const issues = await client.issues({
    filter: {
      assignee: { id: { eq: viewer.id } },
      updatedAt: { gte: lookbackDate },
    },
  });

  const categorized: CategorizedTasks = {
    done: [],
    inReview: [],
    inProgress: [],
    other: [],
  };

  for (const issue of issues.nodes) {
    const state = await issue.state;
    const taskInfo: TaskInfo = {
      id: issue.id,
      title: issue.title,
      status: state?.name || 'Unknown',
      url: issue.url,
      updatedAt: issue.updatedAt,
    };

    // Categorize based on state type
    const stateType = state?.type;
    if (stateType === 'completed') {
      categorized.done.push(taskInfo);
    } else if (state?.name.toLowerCase().includes('review')) {
      categorized.inReview.push(taskInfo);
    } else if (stateType === 'started') {
      categorized.inProgress.push(taskInfo);
    } else {
      categorized.other.push(taskInfo);
    }
  }

  return categorized;
}
