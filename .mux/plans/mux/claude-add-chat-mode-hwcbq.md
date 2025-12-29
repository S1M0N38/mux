# Plan: Add Chat Mode

Add a new "Chat" mode for general-purpose conversation with read-only codebase access.

## Spec Summary

- **Tools allowed:** `Read`, `Glob`, `Grep`, `WebFetch`, `WebSearch`
- **Tools denied:** `Bash`, `task`/`task_*`, all `file_edit_*`, `propose_plan`
- **UI order:** Chat | Plan | Exec
- **Behavior:** Safe exploration mode - no file modifications, no shell, no subagents

---

## Implementation Steps

### 1. Add `chat` to mode types
**File:** `src/common/types/mode.ts`

- Add `"chat"` to `UI_MODE_VALUES` array (before `"plan"`)
- `AGENT_MODE_VALUES` will automatically include it

```ts
export const UI_MODE_VALUES = ["chat", "plan", "exec"] as const;
```

**~5 LoC**

---

### 2. Add Chat agent definition
**File:** `src/node/services/agentDefinitions/builtInAgentDefinitions.ts`

Add new built-in agent:

```ts
{
  id: "chat",
  scope: "built-in",
  frontmatter: {
    name: "Chat",
    description: "General-purpose conversation with read-only codebase access",
    permissionMode: "default",
    subagent: { runnable: false },
    policy: {
      base: "chat",
      tools: {
        only: ["file_read", "web_fetch", "web_search", "google_search"],
      },
    },
  },
  body: [
    "You are in Chat Mode.",
    "",
    "- Answer questions and explore the codebase using read-only tools.",
    "- You cannot edit files, run shell commands, or spawn subagents.",
    "- If the user wants code changes, ask them to switch to Exec mode.",
  ].join("\n"),
}
```

**~20 LoC**

---

### 3. Update tool policy resolution
**File:** `src/node/services/agentDefinitions/resolveToolPolicy.ts`

Add chat mode handling in `resolveToolPolicyForAgent`:

```ts
// Chat mode: no file edits, no bash, no task tools, no propose_plan
const chatHardDeny: ToolPolicy = base === "chat"
  ? [
      { regex_match: "file_edit_.*", action: "disable" },
      { regex_match: "(?:bash|bash_output|bash_background_.*)", action: "disable" },
      { regex_match: "task", action: "disable" },
      { regex_match: "task_.*", action: "disable" },
      { regex_match: "propose_plan", action: "disable" },
    ]
  : [];
```

Include `chatHardDeny` in the final policy array.

**~15 LoC**

---

### 4. Update modeToToolPolicy
**File:** `src/common/utils/ui/modeUtils.ts`

Add chat mode case:

```ts
if (mode === "chat") {
  return [
    { regex_match: "propose_plan", action: "disable" },
    { regex_match: "file_edit_.*", action: "disable" },
    { regex_match: "(?:bash|bash_output|bash_background_.*)", action: "disable" },
    { regex_match: "task", action: "disable" },
    { regex_match: "task_.*", action: "disable" },
  ];
}
```

**~10 LoC**

---

### 5. Add Chat mode color
**File:** `src/browser/styles/globals.css`

Add CSS variables for chat mode (green/teal to differentiate from blue Plan and purple Exec):

```css
--color-chat-mode: hsl(160 60% 40%);
--color-chat-mode-hover: hsl(160 60% 50%);
--color-chat-mode-light: hsl(160 60% 65%);
```

Add to all theme variants (dark, light, solarized-dark, solarized-light).

**~20 LoC**

---

### 6. Update AgentModePicker UI
**File:** `src/browser/components/AgentModePicker.tsx`

Changes needed:

1. Update `formatAgentIdLabel` to handle `"chat"` case
2. Update `resolveAgentOptions` to order: Chat, Plan, Exec, ...rest
3. Update `resolveActiveClassName` to handle chat policyBase
4. Update `isBuiltinAgent` check: `normalizedAgentId === "exec" || normalizedAgentId === "plan" || normalizedAgentId === "chat"`
5. Add Chat button before Plan button in the render
6. Update tooltip text: "Cycle between Chat → Plan → Exec → Other"

**~40 LoC**

---

### 7. Update mode transition handling (if needed)
**File:** `src/browser/utils/messages/modelMessageTransform.ts`

The `injectModeTransition` function may need to handle chat↔exec and chat↔plan transitions. Review if special context injection is needed (likely minimal - chat has no plan file concept).

**~5 LoC**

---

## Files Changed Summary

| File | Changes | LoC |
|------|---------|-----|
| `src/common/types/mode.ts` | Add "chat" to mode enums | ~5 |
| `src/node/services/agentDefinitions/builtInAgentDefinitions.ts` | Add Chat agent definition | ~20 |
| `src/node/services/agentDefinitions/resolveToolPolicy.ts` | Add chat hard-deny rules | ~15 |
| `src/common/utils/ui/modeUtils.ts` | Add chat case to modeToToolPolicy | ~10 |
| `src/browser/styles/globals.css` | Add chat-mode color variables | ~20 |
| `src/browser/components/AgentModePicker.tsx` | Add Chat button, update ordering | ~40 |
| `src/browser/utils/messages/modelMessageTransform.ts` | Handle chat transitions | ~5 |

**Total: ~115 LoC**

---

## Testing

1. Switch to Chat mode via UI picker
2. Verify only read-only tools are available (Read, Glob, Grep, WebFetch, WebSearch)
3. Verify Bash, file edit, and task tools are blocked
4. Verify mode cycling works: Chat → Plan → Exec → (pinned) → Chat
5. Verify chat mode color displays correctly in picker
