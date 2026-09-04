#!/usr/bin/env python3
"""Classify a shell command for agent-safety guardrails.

Reads Cursor beforeShellExecution JSON ({"command": "..."}) or Claude Code
PreToolUse JSON ({"tool_input": {"command": "..."}}) from stdin.

Exit 2 and print permission:deny when the command is blocked (fail-closed).
Exit 0 and print permission:allow otherwise.
Parse failures deny.
"""

from __future__ import annotations

import json
import os
import shlex
import sys

GIT_VALUE_FLAGS = {
    "-C",
    "-c",
    "--git-dir",
    "--work-tree",
    "--namespace",
    "--super-prefix",
    "--exec-path",
    "--config-env",
}

GIT_BARE_FLAGS = {
    "-p",
    "-P",
    "--paginate",
    "--no-pager",
    "--bare",
    "--no-replace-objects",
    "--no-optional-locks",
    "--literal-pathspecs",
    "--glob-pathspecs",
    "--noglob-pathspecs",
    "--icase-pathspecs",
    "--html-path",
    "--man-path",
    "--info-path",
}


def load_payload(raw: str) -> dict:
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise ValueError("hook payload is not an object")
    return data


def extract_command(data: dict) -> str:
    tool_input = data.get("tool_input")
    if isinstance(tool_input, dict) and isinstance(tool_input.get("command"), str):
        return tool_input["command"]
    command = data.get("command")
    if isinstance(command, str):
        return command
    return ""


def tokenize(command: str) -> list[str]:
    try:
        return shlex.split(command, posix=True)
    except ValueError:
        return command.split()


def git_subcommand(tokens: list[str]) -> tuple[str | None, list[str]]:
    try:
        i = next(idx for idx, tok in enumerate(tokens) if tok == "git" or tok.endswith("/git"))
    except StopIteration:
        return None, []
    i += 1
    while i < len(tokens):
        tok = tokens[i]
        if tok == "--":
            i += 1
            break
        if tok.startswith("--git-dir=") or tok.startswith("--work-tree=") or tok.startswith(
            "--namespace="
        ) or tok.startswith("--super-prefix=") or tok.startswith("--exec-path="):
            i += 1
            continue
        if tok in GIT_VALUE_FLAGS:
            i += 2
            continue
        if tok in GIT_BARE_FLAGS or (tok.startswith("-") and tok not in {"-C", "-c"}):
            # Unknown global flag: skip only known flags; a subcommand does not start with -
            if tok.startswith("-"):
                i += 1
                continue
        break
    if i >= len(tokens):
        return None, []
    return tokens[i], tokens[i + 1 :]


def has_force_clean(args: list[str]) -> bool:
    joined = " ".join(args)
    for arg in args:
        if arg in {"-f", "--force", "-fd", "-df", "-fx", "-fdx", "-xfd"}:
            return True
        if arg.startswith("-") and not arg.startswith("--") and "f" in arg:
            return True
    return " --force" in f" {joined}"


def dangerous_git(sub: str, args: list[str]) -> str | None:
    if sub == "push":
        return "git push is a human step; commit locally instead"
    if sub == "reset" and "--hard" in args:
        return "git reset --hard discards work"
    if sub == "clean" and has_force_clean(args):
        return "git clean --force deletes untracked files"
    if sub == "branch" and ("-D" in args or ("--delete" in args and "--force" in args)):
        return "git branch -D deletes a branch"
    if sub in {"checkout", "restore"} and "." in args:
        return f"git {sub} . overwrites the worktree"
    if sub == "stash" and args and args[0] in {"drop", "clear"}:
        return "git stash drop/clear discards stashed work"
    if sub in {"filter-branch", "filter-repo"}:
        return "history rewrite is blocked"
    return None


def is_pipe_to_shell(command: str) -> bool:
    lowered = command.lower()
    if "|" not in lowered:
        return False
    fetches = any(name in lowered for name in ("curl ", "wget ", "curl\t", "wget\t"))
    shells = any(name in lowered for name in (" bash", " sh", "|bash", "|sh", " zsh"))
    return fetches and shells


def is_destructive_rm(tokens: list[str]) -> bool:
    if not tokens or os.path.basename(tokens[0]) != "rm":
        return False
    recursive = False
    force = False
    paths: list[str] = []
    for tok in tokens[1:]:
        if tok.startswith("-") and not tok.startswith("--"):
            if "r" in tok or "R" in tok:
                recursive = True
            if "f" in tok:
                force = True
            continue
        if tok in {"--recursive", "--force"}:
            recursive = recursive or tok == "--recursive"
            force = force or tok == "--force"
            continue
        paths.append(tok)
    if not (recursive and force):
        return False
    blocked = {"/", "/*", "~", "$HOME", "${HOME}", ".", "..", ".git"}
    home = os.path.expanduser("~")
    for path in paths:
        expanded = os.path.expanduser(path)
        if path in blocked or expanded in {"/", home}:
            return True
        if path.rstrip("/") == ".git" or expanded.rstrip("/").endswith("/.git"):
            return True
    return False


def classify(command: str) -> str | None:
    stripped = " ".join(command.split())
    if not stripped:
        return "empty command; fail-closed"
    if is_pipe_to_shell(stripped):
        return "piping a download into a shell is blocked"
    tokens = tokenize(stripped)
    if is_destructive_rm(tokens):
        return "recursive force-delete of a root, home, or .git path is blocked"
    sub, args = git_subcommand(tokens)
    if sub:
        reason = dangerous_git(sub, args)
        if reason:
            return reason
    return None


def emit(deny: bool, command: str, reason: str | None) -> int:
    if deny:
        message = f"BLOCKED by agent-safety: {reason}. Command: {command}"
        payload = {
            "permission": "deny",
            "agent_message": message,
            "user_message": message,
        }
        sys.stdout.write(json.dumps(payload) + "\n")
        sys.stderr.write(message + "\n")
        return 2
    sys.stdout.write(json.dumps({"permission": "allow"}) + "\n")
    return 0


def main() -> int:
    raw = sys.stdin.read()
    try:
        data = load_payload(raw)
        command = extract_command(data)
    except (json.JSONDecodeError, ValueError) as error:
        return emit(True, "", f"unreadable hook payload ({error})")
    reason = classify(command)
    return emit(reason is not None, command, reason)


if __name__ == "__main__":
    raise SystemExit(main())
