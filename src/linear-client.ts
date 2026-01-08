import { LinearClient } from '@linear/sdk';

export interface TaskInfo {
  id: string;
  title: string;
  status: string;
  url: string;
  updatedAt: Date;
  description: string;
}

export interface CategorizedTasks {
  done: TaskInfo[];
  inReview: TaskInfo[];
  inProgress: TaskInfo[];
  other: TaskInfo[];
}

export interface UserTasks {
  userId: string;
  userName: string;
  tasks: CategorizedTasks;
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
      cycle: { isActive: { eq: true } },
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
      status: state?.name || "Unknown",
      url: issue.url,
      updatedAt: issue.updatedAt,
      description: issue.description || "",
    };

    // Categorize based on state type
    const stateType = state?.type;
    if (stateType === "completed") {
      categorized.done.push(taskInfo);
    } else if (state?.name.toLowerCase().includes("review")) {
      categorized.inReview.push(taskInfo);
    } else if (stateType === "started") {
      categorized.inProgress.push(taskInfo);
    } else {
      categorized.other.push(taskInfo);
    }
  }

  return categorized;
}

export async function fetchAllUsersRecentTasks(
  apiKey: string,
  hoursLookback: number = 24
): Promise<UserTasks[]> {
  const client = new LinearClient({ apiKey });

  // Calculate the date threshold
  const lookbackDate = new Date();
  lookbackDate.setHours(lookbackDate.getHours() - hoursLookback);

  // Get the current user's team
  const viewer = await client.viewer;
  const teams = await viewer.teams();

  if (teams.nodes.length === 0) {
    throw new Error("No teams found for the current user");
  }

  // Use the first team
  const team = teams.nodes[0];
  if (!team) {
    throw new Error("Team is undefined");
  }

  const members = await team.members();

  // Fetch issues for all team members
  const allIssues = await client.issues({
    filter: {
      team: { id: { eq: team.id } },
      updatedAt: { gte: lookbackDate },
      cycle: { isActive: { eq: true } },
    },
  });

  // Group tasks by user
  const userTasksMap = new Map<string, UserTasks>();

  for (const issue of allIssues.nodes) {
    const assignee = await issue.assignee;
    if (!assignee) continue;

    const state = await issue.state;
    const taskInfo: TaskInfo = {
      id: issue.id,
      title: issue.title,
      status: state?.name || "Unknown",
      url: issue.url,
      updatedAt: issue.updatedAt,
      description: issue.description || "",
    };

    // Get or create user tasks entry
    if (!userTasksMap.has(assignee.id)) {
      userTasksMap.set(assignee.id, {
        userId: assignee.id,
        userName: assignee.name,
        tasks: {
          done: [],
          inReview: [],
          inProgress: [],
          other: [],
        },
      });
    }

    const userTasks = userTasksMap.get(assignee.id)!;

    // Categorize based on state type
    const stateType = state?.type;
    if (stateType === "completed") {
      userTasks.tasks.done.push(taskInfo);
    } else if (state?.name.toLowerCase().includes("review")) {
      userTasks.tasks.inReview.push(taskInfo);
    } else if (stateType === "started") {
      userTasks.tasks.inProgress.push(taskInfo);
    } else {
      userTasks.tasks.other.push(taskInfo);
    }
  }

  // Filter out users with no tasks and sort by name
  return Array.from(userTasksMap.values())
    .filter((userTasks) => {
      const total =
        userTasks.tasks.done.length +
        userTasks.tasks.inReview.length +
        userTasks.tasks.inProgress.length +
        userTasks.tasks.other.length;
      return total > 0;
    })
    .sort((a, b) => a.userName.localeCompare(b.userName));
}
