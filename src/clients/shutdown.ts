import { tasks } from "@/utils/cron";

export async function shutdown(): Promise<number> {
  tasks.forEach((task) => task.destroy());
  return 0;
}
