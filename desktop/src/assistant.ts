import type {
  AssistantAction,
  AssistantCatalog,
  BrowserProfile,
} from "./types";

export interface AssistantPlan {
  heard: string;
  summary: string;
  actions: AssistantAction[];
  notes: string[];
  understood: boolean;
}

const siteAliases: Record<string, string> = {
  gmail: "https://mail.google.com/",
  youtube: "https://www.youtube.com/",
  github: "https://github.com/",
  calendar: "https://calendar.google.com/",
  drive: "https://drive.google.com/",
  discord: "https://discord.com/app",
};

const appAliases: Record<string, string[]> = {
  discord: ["discord"],
  notepad: ["notepad", "notes"],
  word: ["word", "microsoft word", "ms word"],
  chrome: ["chrome", "google chrome"],
  edge: ["edge", "microsoft edge"],
  vscode: ["vs code", "vscode", "visual studio code"],
  brave: ["brave", "brave browser"],
};

export function stripWakePhrase(value: string) {
  return value
    .trim()
    .replace(
      /^(?:hey|hi|hello|what(?:'s| is) up)[, ]+(?:doaorel|doaor|doar)[, ]*/i,
      "",
    )
    .trim();
}

function tokens(value: string) {
  return value.toLowerCase().match(/[a-z0-9@.]+/g) ?? [];
}

function score(haystack: string, needle: string) {
  const hay = tokens(haystack);
  const search = tokens(needle);
  if (!search.length) return 0;
  return (
    search.reduce(
      (total, token) =>
        total +
        (hay.some((word) => word.includes(token) || token.includes(word))
          ? 1
          : 0),
      0,
    ) / search.length
  );
}

function wantedProfile(text: string, profiles: BrowserProfile[]) {
  const lowered = text.toLowerCase();
  const accountWord = lowered.match(
    /(?:my|the)\s+([a-z0-9._-]+)\s+(?:account|profile)/,
  )?.[1];
  if (!accountWord) return undefined;
  return profiles.find((profile) =>
    `${profile.name} ${profile.account}`.toLowerCase().includes(accountWord),
  );
}

function appAction(
  text: string,
  catalog: AssistantCatalog,
): AssistantAction | undefined {
  const lowered = text.toLowerCase();
  for (const [id, aliases] of Object.entries(appAliases)) {
    if (!aliases.some((alias) => lowered.includes(alias))) continue;
    const app = catalog.apps.find((candidate) => candidate.id === id);
    if (!app) return undefined;
    return {
      id: `app:${app.id}`,
      kind: "launchApp",
      label: `Open ${app.name}`,
      detail: `Installed ${app.category.toLowerCase()} app`,
      appId: app.id,
    };
  }
  const found = catalog.apps.find((app) =>
    lowered.includes(app.name.toLowerCase()),
  );
  return found
    ? {
        id: `app:${found.id}`,
        kind: "launchApp",
        label: `Open ${found.name}`,
        detail: `Installed ${found.category.toLowerCase()} app`,
        appId: found.id,
      }
    : undefined;
}

function webAction(
  text: string,
  catalog: AssistantCatalog,
): AssistantAction | undefined {
  const lowered = text.toLowerCase();
  const profile = wantedProfile(text, catalog.profiles);
  for (const [name, url] of Object.entries(siteAliases)) {
    if (!lowered.includes(name)) continue;
    return profile
      ? {
          id: `profile:${profile.browserId}:${profile.directory}:${name}`,
          kind: "openInProfile",
          label: `Open ${name} in ${profile.name}`,
          detail: profile.account || `${profile.browserId} profile`,
          url,
          browserId: profile.browserId,
          profileDirectory: profile.directory,
        }
      : {
          id: `url:${name}`,
          kind: "openUrl",
          label: `Open ${name}`,
          detail: new URL(url).hostname,
          url,
        };
  }
  const stop = new Set([
    "open",
    "go",
    "to",
    "look",
    "through",
    "the",
    "my",
    "bookmarks",
    "bookmark",
    "for",
    "me",
    "please",
    "chrome",
    "edge",
    "website",
    "site",
    "account",
    "profile",
    "work",
  ]);
  const query = tokens(text)
    .filter((word) => !stop.has(word))
    .join(" ");
  const bookmark = [...catalog.bookmarks]
    .map((item) => ({
      item,
      rank: Math.max(score(item.title, query), score(item.url, query) * 0.85),
    }))
    .filter(({ rank }) => rank >= 0.5)
    .sort((a, b) => b.rank - a.rank)[0]?.item;
  if (!bookmark) return undefined;
  const bookmarkProfile =
    profile ??
    catalog.profiles.find(
      (item) =>
        item.browserId === bookmark.browserId &&
        item.directory === bookmark.profileDirectory,
    );
  return bookmarkProfile
    ? {
        id: `bookmark:${bookmark.url}`,
        kind: "openInProfile",
        label: `Open ${bookmark.title}`,
        detail: `${bookmarkProfile.name} bookmark`,
        url: bookmark.url,
        browserId: bookmarkProfile.browserId,
        profileDirectory: bookmarkProfile.directory,
      }
    : {
        id: `bookmark:${bookmark.url}`,
        kind: "openUrl",
        label: `Open ${bookmark.title}`,
        detail: "Browser bookmark",
        url: bookmark.url,
      };
}

export function planAssistantRequest(
  raw: string,
  catalog: AssistantCatalog,
): AssistantPlan {
  const heard = stripWakePhrase(raw);
  if (!heard)
    return {
      heard,
      summary: "I’m ready when you are.",
      actions: [],
      notes: [],
      understood: false,
    };
  const clauses = heard
    .split(/\s+(?:and then|then|and)\s+/i)
    .map((item) => item.trim())
    .filter(Boolean);
  const actions: AssistantAction[] = [];
  const notes: string[] = [];
  for (const clause of clauses) {
    const lowered = clause.toLowerCase();
    const webFirst =
      /bookmark|gmail|youtube|github|calendar|drive|moodle|website|site|account|profile|in (?:my )?browser|browser instead/.test(
        lowered,
      );
    const action = webFirst
      ? (webAction(clause, catalog) ?? appAction(clause, catalog))
      : (appAction(clause, catalog) ?? webAction(clause, catalog));
    if (action && !actions.some((item) => item.id === action.id)) {
      actions.push(action);
      if (
        /write|type|essay|create (?:a )?document|message|email|click|scroll|search/.test(
          lowered,
        )
      )
        notes.push(
          `doaorel can open the destination, but “${clause}” still needs the upcoming screen-control and writing layer.`,
        );
    } else if (
      /write|type|essay|create (?:a )?document|message|email|click|scroll|search/.test(
        lowered,
      )
    )
      notes.push(
        `“${clause}” needs the upcoming screen-control and writing layer.`,
      );
    else
      notes.push(
        `I couldn’t safely map “${clause}” to an installed app or bookmark yet.`,
      );
  }
  return {
    heard,
    summary: actions.length
      ? `${actions.length} ready action${actions.length === 1 ? "" : "s"}. Review, then run.`
      : "I understood the request, but no safe action is ready yet.",
    actions,
    notes,
    understood: actions.length > 0,
  };
}
