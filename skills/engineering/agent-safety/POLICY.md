# Blocked commands

The classifier in `scripts/agent-safety-hook.py` is the source of truth. This file is the map of *why*.

| Family | Blocked | Left alone |
| --- | --- | --- |
| Git publish | `git push` and any global-option spelling (`git -C . push`) | `git status`, `git add`, `git commit`, `git diff`, `git log` |
| Git discard | `git reset --hard`, `git clean -f` / `-fd`, `git checkout .`, `git restore .`, `git stash drop` / `clear`, `git branch -D` | `git reset` without `--hard`, `git clean -n`, `git branch -d` |
| History | `git filter-branch`, `git filter-repo` | ordinary rebase of the agent's own branch |
| Shell download | `curl … \| bash`, `wget … \| sh` | `curl` to a file the human asked for |
| Filesystem | `rm -rf` of `/`, `$HOME`, `~`, or `.git` | `rm -rf dist`, `node_modules`, build dirs |

Parse failures **deny**. Missing `python3` **denies**. That is fail-closed: a broken hook must not look installed while blocking nothing.

The hook watches the agent's shell tool. It does not wrap `git` on disk, so a human terminal is unchanged.
