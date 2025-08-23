#!/usr/bin/env python3
"""
deploy.py — Typer CLI to build/publish frontend & backend.

Examples:
  python deploy.py frontend deploy
  python deploy.py backend deploy
  python deploy.py backend logs -f -n 200
  python deploy.py server nginx-reload
  python deploy.py --forward-agent frontend publish
  python deploy.py --config staging.toml backend deploy

Env overrides:
  DEPLOY_CONFIG (path to toml), DEPLOY_SSH_PORT
"""

from __future__ import annotations

import getpass
import os
import shlex
import shutil
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

import typer

# ---- TOML loader ----
try:
    import tomllib  # py311+
except ModuleNotFoundError:  # pragma: no cover
    import tomli as tomllib  # type: ignore

DEFAULT_CONFIG_PATH = Path(os.getenv("DEPLOY_CONFIG", "deploy.toml"))

app = typer.Typer(add_completion=False, help="Build and deploy utilities.")
frontend_app = typer.Typer(help="Frontend build/publish commands.")
backend_app = typer.Typer(help="Backend build/publish commands.")
server_app = typer.Typer(help="Server helpers (nginx, etc.).")
app.add_typer(frontend_app, name="frontend")
app.add_typer(backend_app, name="backend")
app.add_typer(server_app, name="server")

CONFIG: Dict[str, Any] = {}  # set in @app.callback


def check_tool(name: str) -> None:
    if shutil.which(name) is None:
        typer.secho(f"Required tool '{name}' not found in PATH.", fg=typer.colors.RED)
        raise typer.Exit(1)


def run(
    cmd: List[str], cwd: Optional[Path] = None, input_bytes: Optional[bytes] = None
) -> None:
    typer.secho("$ " + " ".join(shlex.quote(c) for c in cmd), fg=typer.colors.BLUE)
    try:
        subprocess.run(
            cmd, cwd=str(cwd) if cwd else None, check=True, input=input_bytes
        )
    except subprocess.CalledProcessError as e:
        typer.secho(
            f"Command failed with exit code {e.returncode}.", fg=typer.colors.RED
        )
        raise typer.Exit(e.returncode)


def cfg(path: str, default=None):
    """Read nested keys like 'server.user' or 'frontend.remote_path' from CONFIG."""
    cur: Any = CONFIG
    for k in path.split("."):
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return cur


def ssh_base(
    user: str,
    host: str,
    port: int,
    *,
    forward_agent: bool,
    control_master: bool = True,
) -> List[str]:
    """Build the ssh base command (agent forwarding + connection multiplexing)."""
    check_tool("ssh")
    cmd = ["ssh", "-p", str(port)]
    if forward_agent:
        cmd += ["-A"]
    if control_master:
        control_path = os.path.expanduser("~/.ssh/cm-%r@%h:%p")
        cmd += [
            "-o",
            "ControlMaster=auto",
            "-o",
            f"ControlPath={control_path}",
            "-o",
            "ControlPersist=60s",
        ]
    cmd += [f"{user}@{host}"]
    return cmd


def ssh_run(
    user: str,
    host: str,
    port: int,
    remote_cmd: str,
    *,
    login_shell: bool = True,
    forward_agent: bool = False,
) -> None:
    """Run a remote command via ssh; wrap in bash -lc to get a login-like PATH."""
    shell_cmd = ["bash", "-lc", remote_cmd] if login_shell else ["sh", "-c", remote_cmd]
    cmd = ssh_base(user, host, port, forward_agent=forward_agent) + [
        "--",
        shlex.join(shell_cmd),
    ]
    run(cmd)


def ssh_sudo_run(
    user: str,
    host: str,
    port: int,
    remote_cmd: str,
    *,
    forward_agent: bool = False,
    sudo_password: Optional[str] = None,
) -> None:
    """
    Run a remote command with sudo, prompting for the password if needed.
    Uses: sudo -S -p '' to read password from stdin (one-time, not echoed).
    """
    if sudo_password is None:
        sudo_password = getpass.getpass(f"Sudo password for {user}@{host}: ")

    # We run bash -lc so shell expansions/paths work; sudo -S reads from stdin.
    wrapped = f"sudo -S -p '' bash -lc {shlex.quote(remote_cmd)}"
    cmd = ssh_base(user, host, port, forward_agent=forward_agent) + ["--", wrapped]
    run(cmd, input_bytes=(sudo_password + "\n").encode())


def ensure_dir_exists(p: Path, desc: str = "directory") -> None:
    if not p.exists():
        typer.secho(f"{desc.capitalize()} does not exist: {p}", fg=typer.colors.RED)
        raise typer.Exit(1)


def cfg_dict(path: str) -> Dict[str, str]:
    v = cfg(path, {}) or {}
    return {str(k): str(v[k]) for k in v}


@app.callback()
def main(
    config: Path = typer.Option(
        DEFAULT_CONFIG_PATH, "--config", "-c", exists=False, help="Path to deploy.toml"
    ),
    forward_agent: bool = typer.Option(
        False,
        "--forward-agent/--no-forward-agent",
        help="Pass -A to ssh (use your local ssh-agent).",
    ),
):
    """Load config and store global toggle(s)."""
    global CONFIG
    if config.exists():
        with open(config, "rb") as f:
            CONFIG = tomllib.load(f)
        typer.secho(f"Loaded config: {config}", fg=typer.colors.CYAN)
    else:
        typer.secho(
            f"No config found at {config} (CLI flags & defaults will be used).",
            fg=typer.colors.YELLOW,
        )
    # stash the global flag
    CONFIG["_forward_agent"] = forward_agent


# ----------------- FRONTEND -----------------


@frontend_app.command("build")
def frontend_build(
    frontend_dir: Path = typer.Option(None, "--dir", "-d"),
    run_install: bool = typer.Option(False, "--install"),
    build_script: str = typer.Option("build", "--script"),
):
    check_tool("npm")
    frontend_dir = frontend_dir or Path(cfg("frontend.dir", "frontend"))
    ensure_dir_exists(frontend_dir, "frontend directory")
    if run_install:
        run(["npm", "ci"], cwd=frontend_dir)

    # Merge configured env (e.g., frontend.env.production) into build env
    build_env = os.environ.copy()
    build_env.update(cfg_dict("frontend.env.production"))
    typer.secho(
        f"Injecting {len(cfg_dict('frontend.env.production'))} env var(s) into build.",
        fg=typer.colors.CYAN,
    )
    typer.secho(
        " ".join([f"{k}={v}" for k, v in cfg_dict("frontend.env.production").items()]),
        fg=typer.colors.CYAN,
    )
    # Use subprocess directly to pass env
    typer.secho("$ npm run " + build_script, fg=typer.colors.BLUE)
    try:
        subprocess.run(
            ["npm", "run", build_script],
            cwd=str(frontend_dir),
            check=True,
            env=build_env,
        )
    except subprocess.CalledProcessError as e:
        typer.secho(
            f"Command failed with exit code {e.returncode}.", fg=typer.colors.RED
        )
        raise typer.Exit(e.returncode)

    typer.secho("Frontend build complete ✅", fg=typer.colors.GREEN)


def rsync_push(
    source: Path,
    user: str,
    host: str,
    dest_path: str,
    *,
    ssh_port: int = 22,
    delete: bool = True,
    progress: bool = True,
    dry_run: bool = False,
    excludes: Optional[List[str]] = None,
    forward_agent: bool = False,
):
    check_tool("rsync")
    ensure_dir_exists(source, "local directory")
    ssh_cmd = ["ssh", "-p", str(ssh_port)]
    if forward_agent:
        ssh_cmd.append("-A")
    ssh_transport = " ".join(shlex.quote(x) for x in ssh_cmd)
    rsync_cmd = ["rsync", "-avz", "-e", ssh_transport]
    if progress:
        rsync_cmd.append("--progress")
    if delete:
        rsync_cmd.append("--delete")
    if dry_run:
        rsync_cmd.append("--dry-run")
    if excludes:
        for pat in excludes:
            rsync_cmd += ["--exclude", pat]

    src = str(source if str(source).endswith("/") else Path(str(source) + "/"))
    dest = f"{user}@{host}:{dest_path}"
    rsync_cmd += [src, dest]
    run(rsync_cmd)


@frontend_app.command("publish")
def frontend_publish(
    local_build_dir: Path = typer.Option(None, "--local-build-dir"),
    remote_user: str = typer.Option(None, "--user", "-u"),
    remote_host: str = typer.Option(None, "--host", "-h"),
    remote_path: str = typer.Option(None, "--remote-path", "-r"),
    ssh_port: int = typer.Option(None, "--ssh-port"),
    delete: bool = typer.Option(True, "--delete/--no-delete"),
    dry_run: bool = typer.Option(False, "--dry-run"),
    excludes_csv: Optional[str] = typer.Option(None, "--exclude"),
):
    fwd = bool(CONFIG.get("_forward_agent", False))
    local_build_dir = local_build_dir or Path(
        cfg("frontend.local_build_dir", "frontend/build")
    )
    remote_user = remote_user or cfg("server.user")
    remote_host = remote_host or cfg("server.host")
    remote_path = remote_path or cfg("frontend.remote_path")
    ssh_port = ssh_port or int(os.getenv("DEPLOY_SSH_PORT", cfg("server.ssh_port", 22)))
    excludes = [s.strip() for s in excludes_csv.split(",")] if excludes_csv else None

    rsync_push(
        local_build_dir,
        remote_user,
        remote_host,
        remote_path,
        ssh_port=ssh_port,
        delete=delete,
        dry_run=dry_run,
        excludes=excludes,
        forward_agent=fwd,
    )
    typer.secho("Frontend publish complete 🚀", fg=typer.colors.GREEN)


@frontend_app.command("deploy")
def frontend_deploy(
    frontend_dir: Path = typer.Option(None, "--dir", "-d"),
    run_install: bool = typer.Option(False, "--install"),
    build_script: str = typer.Option("build", "--script"),
    local_build_dir: Path = typer.Option(None, "--local-build-dir"),
    remote_user: str = typer.Option(None, "--user", "-u"),
    remote_host: str = typer.Option(None, "--host", "-h"),
    remote_path: str = typer.Option(None, "--remote-path", "-r"),
    ssh_port: int = typer.Option(None, "--ssh-port"),
    delete: bool = typer.Option(True, "--delete/--no-delete"),
    dry_run: bool = typer.Option(False, "--dry-run"),
    excludes_csv: Optional[str] = typer.Option(None, "--exclude"),
):
    frontend_dir = frontend_dir or Path(cfg("frontend.dir", "frontend"))
    frontend_build(
        frontend_dir=frontend_dir, run_install=run_install, build_script=build_script
    )

    local_build_dir = local_build_dir or Path(
        cfg("frontend.local_build_dir", "frontend/build")
    )
    remote_user = remote_user or cfg("server.user")
    remote_host = remote_host or cfg("server.host")
    remote_path = remote_path or cfg("frontend.remote_path")
    ssh_port = ssh_port or int(os.getenv("DEPLOY_SSH_PORT", cfg("server.ssh_port", 22)))
    excludes = (
        [s.strip() for s in (excludes_csv or "").split(",")] if excludes_csv else None
    )
    fwd = bool(CONFIG.get("_forward_agent", False))

    rsync_push(
        local_build_dir,
        remote_user,
        remote_host,
        remote_path,
        ssh_port=ssh_port,
        delete=delete,
        dry_run=dry_run,
        excludes=excludes,
        forward_agent=fwd,
    )
    typer.secho("Frontend deploy complete 🎉", fg=typer.colors.GREEN)


# ----------------- BACKEND -----------------


@backend_app.command("publish")
def backend_publish(
    src_dir: Path = typer.Option(None, "--src-dir"),
    remote_user: str = typer.Option(None, "--user", "-u"),
    remote_host: str = typer.Option(None, "--host", "-h"),
    remote_path: str = typer.Option(None, "--remote-path", "-r"),
    ssh_port: int = typer.Option(None, "--ssh-port"),
    service_name: str = typer.Option(None, "--service"),
    venv_path: Optional[str] = typer.Option(None, "--venv-path"),
    post_sync: Optional[str] = typer.Option(None, "--post-sync"),
    restart: bool = typer.Option(True, "--restart/--no-restart"),
    dry_run: bool = typer.Option(False, "--dry-run"),
):
    src_dir = src_dir or Path(cfg("backend.src_dir"))
    remote_user = remote_user or cfg("server.user")
    remote_host = remote_host or cfg("server.host")
    remote_path = remote_path or cfg("backend.remote_path")
    service_name = service_name or cfg("backend.service_name")
    ssh_port = ssh_port or int(os.getenv("DEPLOY_SSH_PORT", cfg("server.ssh_port", 22)))
    venv_path = venv_path or cfg("backend.venv_path")
    post_sync = post_sync or cfg("backend.post_sync", "uv sync --frozen")
    excludes = [
        ".venv",
        "__pycache__",
        ".mypy_cache",
        ".pytest_cache",
        ".git",
        ".DS_Store",
    ]
    fwd = bool(CONFIG.get("_forward_agent", False))

    # sync source
    rsync_push(
        src_dir,
        remote_user,
        remote_host,
        remote_path,
        ssh_port=ssh_port,
        delete=True,
        dry_run=dry_run,
        excludes=excludes,
        forward_agent=fwd,
    )
    if dry_run:
        typer.secho("Backend publish dry-run complete.", fg=typer.colors.YELLOW)
        return

    # post-sync (deps)
    remote_cmds = [
        f"cd {shlex.quote(remote_path)}",
        f"[ -d {shlex.quote(venv_path)} ] || python3 -m venv {shlex.quote(venv_path)}",
        f"source {shlex.quote(venv_path)}/bin/activate",
        post_sync,
    ]
    ssh_run(
        remote_user, remote_host, ssh_port, " && ".join(remote_cmds), forward_agent=fwd
    )

    # restart service (with sudo prompt)
    if restart and service_name:
        ssh_sudo_run(
            remote_user,
            remote_host,
            ssh_port,
            f"systemctl restart {shlex.quote(service_name)} && systemctl is-active {shlex.quote(service_name)}",
            forward_agent=fwd,
        )

    typer.secho("Backend publish complete 🚀", fg=typer.colors.GREEN)


@backend_app.command("deploy")
def backend_deploy(**kwargs):
    backend_publish(**kwargs)
    typer.secho("Backend deploy complete 🎉", fg=typer.colors.GREEN)


@backend_app.command("logs")
def backend_logs(
    remote_user: str = typer.Option(None, "--user", "-u"),
    remote_host: str = typer.Option(None, "--host", "-h"),
    ssh_port: int = typer.Option(None, "--ssh-port"),
    service_name: str = typer.Option(None, "--service"),
    follow: bool = typer.Option(True, "--follow/--no-follow", "-f"),
    lines: int = typer.Option(
        200, "--lines", "-n", help="Number of lines to show initially."
    ),
    since: Optional[str] = typer.Option(
        None, "--since", help='e.g. "1h", "2025-08-12 10:00"'
    ),
    use_sudo: bool = typer.Option(
        False,
        "--sudo/--no-sudo",
        help="Read logs with sudo (needed if your user isn't in adm/systemd-journal).",
    ),
):
    remote_user = remote_user or cfg("server.user")
    remote_host = remote_host or cfg("server.host")
    ssh_port = ssh_port or int(os.getenv("DEPLOY_SSH_PORT", cfg("server.ssh_port", 22)))
    service_name = service_name or cfg("backend.service_name")
    fwd = bool(CONFIG.get("_forward_agent", False))

    parts = [f"journalctl -u {shlex.quote(service_name)} --no-pager -n {lines}"]
    if follow:
        parts.append("-f")
    if since:
        parts.append(f"--since {shlex.quote(since)}")

    cmd_str = " ".join(parts)
    if use_sudo:
        ssh_sudo_run(remote_user, remote_host, ssh_port, cmd_str, forward_agent=fwd)
    else:
        ssh_run(remote_user, remote_host, ssh_port, cmd_str, forward_agent=fwd)


# ----------------- SERVER HELPERS -----------------


@server_app.command("nginx-reload")
def nginx_reload(
    remote_user: str = typer.Option(None, "--user", "-u"),
    remote_host: str = typer.Option(None, "--host", "-h"),
    ssh_port: int = typer.Option(None, "--ssh-port"),
):
    """Reload nginx on the server with sudo (prompts for password)."""
    remote_user = remote_user or cfg("server.user")
    remote_host = remote_host or cfg("server.host")
    ssh_port = ssh_port or int(os.getenv("DEPLOY_SSH_PORT", cfg("server.ssh_port", 22)))
    fwd = bool(CONFIG.get("_forward_agent", False))

    # Prompt once for sudo and reuse
    pw = getpass.getpass(f"Sudo password for {remote_user}@{remote_host}: ")
    # test config first; reload if ok
    ssh_sudo_run(
        remote_user,
        remote_host,
        ssh_port,
        "nginx -t",
        forward_agent=fwd,
        sudo_password=pw,
    )
    ssh_sudo_run(
        remote_user,
        remote_host,
        ssh_port,
        "systemctl reload nginx",
        forward_agent=fwd,
        sudo_password=pw,
    )
    typer.secho("Nginx reloaded ✅", fg=typer.colors.GREEN)


@server_app.command("logs")
def frontend_logs(
    remote_user: str = typer.Option(None, "--user", "-u"),
    remote_host: str = typer.Option(None, "--host", "-h"),
    ssh_port: int = typer.Option(None, "--ssh-port"),
    service_name: str = typer.Option(None, "--service"),
    follow: bool = typer.Option(True, "--follow/--no-follow", "-f"),
    lines: int = typer.Option(
        200, "--lines", "-n", help="Number of lines to show initially."
    ),
    since: Optional[str] = typer.Option(
        None, "--since", help='e.g. "1h", "2025-08-12 10:00"'
    ),
    use_sudo: bool = typer.Option(
        False,
        "--sudo/--no-sudo",
        help="Read logs with sudo (needed if your user isn't in adm/systemd-journal).",
    ),
):
    remote_user = remote_user or cfg("server.user")
    remote_host = remote_host or cfg("server.host")
    ssh_port = ssh_port or int(os.getenv("DEPLOY_SSH_PORT", cfg("server.ssh_port", 22)))
    service_name = service_name or cfg("server.service_name", default="nginx.reload")
    fwd = bool(CONFIG.get("_forward_agent", False))

    parts = [f"journalctl -u {shlex.quote(service_name)} --no-pager -n {lines}"]
    if follow:
        parts.append("-f")
    if since:
        parts.append(f"--since {shlex.quote(since)}")

    cmd_str = " ".join(parts)
    if use_sudo:
        ssh_sudo_run(remote_user, remote_host, ssh_port, cmd_str, forward_agent=fwd)
    else:
        ssh_run(remote_user, remote_host, ssh_port, cmd_str, forward_agent=fwd)


if __name__ == "__main__":
    app()
