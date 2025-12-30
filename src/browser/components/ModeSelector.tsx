import React from "react";
import { ToggleGroup, type ToggleOption } from "./ToggleGroup";
import { Tooltip, TooltipTrigger, TooltipContent, HelpIndicator } from "./ui/tooltip";
import { formatKeybind, KEYBINDS } from "@/browser/utils/ui/keybinds";
import type { UIMode } from "@/common/types/mode";
import { cn } from "@/common/lib/utils";

const MODE_OPTIONS: Array<ToggleOption<UIMode>> = [
  { value: "chat", label: "Chat", activeClassName: "bg-chat-mode text-white" },
  { value: "plan", label: "Plan", activeClassName: "bg-plan-mode text-white" },
  { value: "exec", label: "Exec", activeClassName: "bg-exec-mode text-white" },
];

const ModeHelpTooltip: React.FC = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <HelpIndicator>?</HelpIndicator>
    </TooltipTrigger>
    <TooltipContent align="center" className="max-w-80 whitespace-normal">
      <strong>Chat Mode:</strong> Read-only exploration and conversation
      <br />
      <br />
      <strong>Plan Mode:</strong> AI proposes plans but does not edit files
      <br />
      <br />
      <strong>Exec Mode:</strong> AI edits files and executes commands
      <br />
      <br />
      Cycle modes with: {formatKeybind(KEYBINDS.TOGGLE_MODE)}
    </TooltipContent>
  </Tooltip>
);

interface ModeSelectorProps {
  mode: UIMode;
  onChange: (mode: UIMode) => void;
  className?: string;
}

/**
 * ModeSelector - UI control for switching between Chat, Plan and Exec modes
 * Renders responsive layouts with different sizing for different container widths
 */
export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onChange, className }) => {
  return (
    <>
      {/* Full mode selector with labels - visible on wider containers */}
      <div
        className={cn("flex items-center gap-1.5 [@container(max-width:550px)]:hidden", className)}
      >
        <div
          className={cn(
            "rounded-md transition-colors",
            mode === "chat" &&
              "[&>button:nth-of-type(1)]:bg-chat-mode [&>button:nth-of-type(1)]:text-white [&>button:nth-of-type(1)]:hover:bg-chat-mode-hover",
            mode === "plan" &&
              "[&>button:nth-of-type(2)]:bg-plan-mode [&>button:nth-of-type(2)]:text-white [&>button:nth-of-type(2)]:hover:bg-plan-mode-hover",
            mode === "exec" &&
              "[&>button:nth-of-type(3)]:bg-exec-mode [&>button:nth-of-type(3)]:text-white [&>button:nth-of-type(3)]:hover:bg-exec-mode-hover"
          )}
        >
          <ToggleGroup<UIMode> options={MODE_OPTIONS} value={mode} onChange={onChange} />
        </div>
        <ModeHelpTooltip />
      </div>

      {/* Mode Switch - compact version for narrow containers */}
      <div className="ml-auto hidden items-center gap-1.5 [@container(max-width:550px)]:flex">
        <ToggleGroup<UIMode> options={MODE_OPTIONS} value={mode} onChange={onChange} compact />
        <ModeHelpTooltip />
      </div>
    </>
  );
};
