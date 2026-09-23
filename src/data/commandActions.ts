export type CommandActionId = "toggle-theme";
export type CommandActionIcon = "theme";

export interface CommandAction {
  id: CommandActionId;
  label: string;
  description: string;
  keywords: string[];
  icon: CommandActionIcon;
}

export const commandActions: CommandAction[] = [
  {
    id: "toggle-theme",
    label: "Toggle theme",
    description: "Cycle between system, light, and dark themes.",
    keywords: ["theme", "appearance", "dark mode", "light mode"],
    icon: "theme",
  },
];
