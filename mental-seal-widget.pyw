"""
Mental Seal · 思想钢印 - 悬浮窗 v5
系统托盘开关 + 分组 + 逐条勾选 + 窗口缩放 + 主题切换。
双击托盘图标显示/隐藏，右键菜单操作。
"""
import customtkinter as ctk
import os
import threading
import time
import json
import pystray
from PIL import Image, ImageDraw, ImageFont

# === 路径 ===
APPDATA = os.environ.get("APPDATA", "")
GLOBAL_MD = os.path.join(APPDATA, "reasonix", "REASONIX.md")
PROJECT_ROOT = r"C:\Users\Administrator\Desktop\以往"
PROJECT_MD = os.path.join(PROJECT_ROOT, ".reasonix", "REASONIX.md")
STATE_FILE = os.path.join(APPDATA, "reasonix", "mental-seal-state.json")
MARKER_START = "<!-- MENTAL-SEAL:START -->"
MARKER_END = "<!-- MENTAL-SEAL:END -->"
REFRESH_INTERVAL = 3

# === 外观 ===
ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")

COLORS = {
    "bg": "#f8fafc", "card_on": "#ffffff", "card_off": "#f1f5f9",
    "header": "#6366f1", "accent": "#6366f1", "green": "#10b981",
    "red": "#ef4444", "text": "#1e293b", "text_dim": "#94a3b8",
    "border": "#e2e8f0", "section_global": "#ede9fe", "section_project": "#dbeafe",
}


def create_icon():
    """生成托盘图标：🎯 靶心"""
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = 32, 32
    # 外圈
    draw.ellipse([4, 4, 60, 60], outline="#6366f1", width=5)
    # 中圈
    draw.ellipse([14, 14, 50, 50], outline="#6366f1", width=4)
    # 内圈
    draw.ellipse([24, 24, 40, 40], outline="#6366f1", width=3)
    # 中心点
    draw.ellipse([28, 28, 36, 36], fill="#6366f1")
    return img


class GoalItem:
    def __init__(self, text: str, enabled: bool = True):
        self.text = text
        self.enabled = enabled


class MentalSealWidget(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("思想钢印")
        self.attributes("-topmost", True)
        self.attributes("-alpha", 0.96)
        self.configure(fg_color=COLORS["bg"])

        sw = self.winfo_screenwidth()
        self.w = 380
        self.h = 520
        x = sw - self.w - 30
        self.geometry(f"{self.w}x{self.h}+{x}+40")
        self.minsize(320, 360)

        self.global_goals: list[GoalItem] = []
        self.project_goals: list[GoalItem] = []
        self._pinned = True
        self._last_global = ""
        self._last_project = ""
        self._disabled_global: set = set()
        self._disabled_project: set = set()
        self._global_collapsed = False
        self._project_collapsed = False
        self._visible = True
        self._tray_icon = None

        self._load_state()
        self._read_all()
        self._build_ui()
        self._render_all()
        self._start_watcher()

    # ========== UI ==========
    def _build_ui(self):
        header = ctk.CTkFrame(self, fg_color="transparent", height=38)
        header.pack(fill="x", padx=14, pady=(10, 2))

        ctk.CTkLabel(
            header, text="🎯 思想钢印", font=ctk.CTkFont(size=15, weight="bold"),
            text_color=COLORS["header"]
        ).pack(side="left")

        btn_frame = ctk.CTkFrame(header, fg_color="transparent")
        btn_frame.pack(side="right")

        ctk.CTkButton(
            btn_frame, text="🌗", width=28, height=26, corner_radius=6,
            fg_color="transparent", hover_color=COLORS["border"],
            command=self._toggle_theme
        ).pack(side="left", padx=2)

        self.btn_pin = ctk.CTkButton(
            btn_frame, text="📌", width=28, height=26, corner_radius=6,
            fg_color="transparent", hover_color=COLORS["border"],
            command=self._toggle_pin
        ).pack(side="left", padx=2)

        # 最小化到托盘
        ctk.CTkButton(
            btn_frame, text="—", width=28, height=26, corner_radius=6,
            fg_color="transparent", hover_color=COLORS["border"],
            font=ctk.CTkFont(size=13, weight="bold"),
            command=self._hide_to_tray
        ).pack(side="left", padx=2)

        self.scroll = ctk.CTkScrollableFrame(
            self, fg_color="transparent",
            scrollbar_button_color=COLORS["bg"],
            scrollbar_button_hover_color=COLORS["border"],
        )
        self.scroll.pack(fill="both", expand=True, padx=6, pady=(4, 2))

        self.footer = ctk.CTkLabel(
            self, text="", font=ctk.CTkFont(size=10), text_color=COLORS["text_dim"]
        )
        self.footer.pack(padx=14, pady=(2, 8))

    def _render_all(self):
        for w in self.scroll.winfo_children():
            w.destroy()

        self._render_section(
            self.scroll, "🌐 全局目标", "所有项目生效",
            self.global_goals, "global", self._global_collapsed, COLORS["section_global"]
        )
        project_name = os.path.basename(PROJECT_ROOT)
        self._render_section(
            self.scroll, f"📁 {project_name}", "仅当前项目",
            self.project_goals, "project", self._project_collapsed, COLORS["section_project"]
        )

        ga = sum(1 for g in self.global_goals if g.enabled)
        pa = sum(1 for g in self.project_goals if g.enabled)
        self.footer.configure(text=f"🔒 全局 {ga}/{len(self.global_goals)} · 项目 {pa}/{len(self.project_goals)} 已激活")

    def _render_section(self, parent, title, subtitle, goals, scope, collapsed, section_color):
        sec_header = ctk.CTkFrame(parent, fg_color=section_color, corner_radius=8)
        sec_header.pack(fill="x", padx=4, pady=(6, 2))

        inner_h = ctk.CTkFrame(sec_header, fg_color="transparent")
        inner_h.pack(fill="x", padx=10, pady=6)

        arrow = "▸" if collapsed else "▾"
        toggle_lbl = ctk.CTkLabel(
            inner_h, text=f"{arrow} {title}", font=ctk.CTkFont(size=12, weight="bold"),
            text_color=COLORS["text"], cursor="hand2"
        )
        toggle_lbl.pack(side="left")

        ctk.CTkLabel(
            inner_h, text=subtitle, font=ctk.CTkFont(size=9), text_color=COLORS["text_dim"]
        ).pack(side="left", padx=(8, 0))

        ctk.CTkButton(
            inner_h, text="＋", width=24, height=22, corner_radius=6,
            fg_color=COLORS["accent"], hover_color="#4f46e5",
            text_color="#ffffff", font=ctk.CTkFont(size=12, weight="bold"),
            command=lambda s=scope: self._add_goal(s)
        ).pack(side="right")

        toggle_lbl.bind("<Button-1>", lambda e, s=scope: self._toggle_collapse(s))
        sec_header.bind("<Button-1>", lambda e, s=scope: self._toggle_collapse(s))

        if collapsed:
            return

        if not goals:
            ctk.CTkLabel(
                parent, text="  暂无，点击 ＋ 添加",
                font=ctk.CTkFont(size=10), text_color=COLORS["text_dim"], anchor="w"
            ).pack(fill="x", padx=16, pady=4)
            return

        for i, goal in enumerate(goals):
            card_color = COLORS["card_on"] if goal.enabled else COLORS["card_off"]
            card = ctk.CTkFrame(parent, fg_color=card_color, corner_radius=8,
                                border_width=1, border_color=COLORS["border"])
            card.pack(fill="x", padx=10, pady=2)

            inner = ctk.CTkFrame(card, fg_color="transparent")
            inner.pack(fill="x", padx=8, pady=6)

            chk = ctk.CTkCheckBox(
                inner, text="", width=18, checkbox_width=16, checkbox_height=16,
                corner_radius=4, border_width=2,
                fg_color=COLORS["green"], hover_color=COLORS["green"],
                border_color=COLORS["green"] if goal.enabled else COLORS["text_dim"],
                command=lambda s=scope, idx=i: self._toggle_goal(s, idx)
            )
            if goal.enabled:
                chk.select()
            else:
                chk.deselect()
            chk.pack(side="left")

            text_color = COLORS["text"] if goal.enabled else COLORS["text_dim"]
            ctk.CTkLabel(
                inner, text=f"{i+1}. {goal.text}",
                font=ctk.CTkFont(size=10), text_color=text_color,
                anchor="w", justify="left", wraplength=240
            ).pack(side="left", fill="x", expand=True, padx=(8, 0))

            ctk.CTkButton(
                inner, text="✕", width=20, height=20, corner_radius=5,
                fg_color="transparent", hover_color="#fee2e2",
                text_color=COLORS["red"], font=ctk.CTkFont(size=10),
                command=lambda s=scope, idx=i: self._delete_goal(s, idx)
            ).pack(side="right")

    # ========== 托盘 ==========
    def _create_tray(self):
        menu = pystray.Menu(
            pystray.MenuItem("显示/隐藏", self._tray_toggle, default=True),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("📌 置顶", self._tray_pin, checked=lambda item: self._pinned),
            pystray.MenuItem("🌗 切换主题", lambda: self.after(0, self._toggle_theme)),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("退出", self._tray_quit),
        )
        self._tray_icon = pystray.Icon(
            "mental-seal", create_icon(), "思想钢印 · Mental Seal", menu
        )
        threading.Thread(target=self._tray_icon.run, daemon=True).start()

    def _tray_toggle(self, icon=None, item=None):
        self.after(0, self._toggle_visibility)

    def _tray_pin(self, icon=None, item=None):
        self.after(0, self._toggle_pin)

    def _tray_quit(self, icon=None, item=None):
        self.after(0, self._on_close)

    def _toggle_visibility(self):
        if self._visible:
            self._hide_to_tray()
        else:
            self._show_from_tray()

    def _hide_to_tray(self):
        self.withdraw()
        self._visible = False
        if self._tray_icon:
            self._tray_icon.notify("思想钢印已隐藏到托盘", "Mental Seal")

    def _show_from_tray(self):
        self.deiconify()
        self.attributes("-topmost", self._pinned)
        self._visible = True

    # ========== 操作 ==========
    def _toggle_collapse(self, scope):
        if scope == "global":
            self._global_collapsed = not self._global_collapsed
        else:
            self._project_collapsed = not self._project_collapsed
        self._render_all()

    def _toggle_goal(self, scope, idx):
        goals = self.global_goals if scope == "global" else self.project_goals
        goals[idx].enabled = not goals[idx].enabled
        self._write_goals(scope)
        self._render_all()

    def _delete_goal(self, scope, idx):
        goals = self.global_goals if scope == "global" else self.project_goals
        goals.pop(idx)
        self._write_goals(scope)
        self._render_all()

    def _add_goal(self, scope):
        label = "全局" if scope == "global" else "项目"
        dialog = ctk.CTkInputDialog(text=f"输入{label}核心目标：", title="添加核心目标")
        dialog.attributes("-topmost", True)
        result = dialog.get_input()
        if result and result.strip():
            goals = self.global_goals if scope == "global" else self.project_goals
            goals.append(GoalItem(result.strip(), enabled=True))
            self._write_goals(scope)
            self._render_all()

    def _toggle_theme(self):
        current = ctk.get_appearance_mode()
        ctk.set_appearance_mode("Dark" if current == "Light" else "Light")
        self._save_state()

    def _toggle_pin(self):
        self._pinned = not self._pinned
        self.attributes("-topmost", self._pinned)
        self.btn_pin.configure(text="📌" if self._pinned else "📍")

    # ========== 文件读写 ==========
    def _read_goals(self, filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except FileNotFoundError:
            return []
        start = content.find(MARKER_START)
        end = content.find(MARKER_END)
        if start == -1 or end == -1:
            return []
        section = content[start + len(MARKER_START):end]
        return [l.strip()[2:].strip() for l in section.split("\n") if l.strip().startswith("- ")]

    def _read_all(self):
        old_g = {g.text: g.enabled for g in self.global_goals}
        self.global_goals = [GoalItem(t, old_g.get(t, True)) for t in self._read_goals(GLOBAL_MD)]
        for g in self.global_goals:
            if g.text in self._disabled_global:
                g.enabled = False

        old_p = {g.text: g.enabled for g in self.project_goals}
        self.project_goals = [GoalItem(t, old_p.get(t, True)) for t in self._read_goals(PROJECT_MD)]
        for g in self.project_goals:
            if g.text in self._disabled_project:
                g.enabled = False

    def _write_goals(self, scope):
        filepath = GLOBAL_MD if scope == "global" else PROJECT_MD
        goals = self.global_goals if scope == "global" else self.project_goals
        active = [g.text for g in goals if g.enabled]

        lines = [MARKER_START, "", "## 🎯 核心目标（由 Mental Seal · 思想钢印 管理）", "",
                 "> 以下目标在每次会话启动时自动注入 AI 的 system prompt，永不被压缩遗忘。", ""]
        for g in active:
            lines.append(f"- {g}")
        lines.extend(["", MARKER_END])
        block = "\n".join(lines)

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except FileNotFoundError:
            content = ""

        start = content.find(MARKER_START)
        end = content.find(MARKER_END)
        if start != -1 and end != -1 and end > start:
            content = content[:start] + block + content[end + len(MARKER_END):]
        else:
            if content.strip():
                content = content.rstrip("\n") + "\n\n"
            content += block

        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

    # ========== 持久化 ==========
    def _load_state(self):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                state = json.load(f)
            self._disabled_global = set(state.get("disabled_global", []))
            self._disabled_project = set(state.get("disabled_project", []))
            ctk.set_appearance_mode(state.get("appearance", "Light"))
        except (FileNotFoundError, json.JSONDecodeError):
            pass

    def _save_state(self):
        state = {
            "appearance": ctk.get_appearance_mode(),
            "disabled_global": [g.text for g in self.global_goals if not g.enabled],
            "disabled_project": [g.text for g in self.project_goals if not g.enabled],
        }
        try:
            os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
            with open(STATE_FILE, "w", encoding="utf-8") as f:
                json.dump(state, f, ensure_ascii=False, indent=2)
        except OSError:
            pass

    # ========== 文件监控 ==========
    def _start_watcher(self):
        def watch():
            while True:
                time.sleep(REFRESH_INTERVAL)
                changed = False
                try:
                    with open(GLOBAL_MD, "r", encoding="utf-8") as f:
                        g = f.read()
                    if g != self._last_global:
                        self._last_global = g
                        changed = True
                except FileNotFoundError:
                    pass
                try:
                    with open(PROJECT_MD, "r", encoding="utf-8") as f:
                        p = f.read()
                    if p != self._last_project:
                        self._last_project = p
                        changed = True
                except FileNotFoundError:
                    pass
                if changed:
                    self.after(0, self._on_file_changed)
        threading.Thread(target=watch, daemon=True).start()

    def _on_file_changed(self):
        self._read_all()
        self._render_all()

    # ========== 关闭 ==========
    def _on_close(self):
        self._save_state()
        if self._tray_icon:
            self._tray_icon.stop()
        self.destroy()

    def run(self):
        try:
            with open(GLOBAL_MD, "r", encoding="utf-8") as f:
                self._last_global = f.read()
        except FileNotFoundError:
            self._last_global = ""
        try:
            with open(PROJECT_MD, "r", encoding="utf-8") as f:
                self._last_project = f.read()
        except FileNotFoundError:
            self._last_project = ""

        # 关闭窗口 = 隐藏到托盘
        self.protocol("WM_DELETE_WINDOW", self._hide_to_tray)
        self._create_tray()
        self.mainloop()


if __name__ == "__main__":
    import traceback
    try:
        app = MentalSealWidget()
        app.run()
    except Exception:
        err_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "error.log")
        with open(err_path, "w", encoding="utf-8") as f:
            traceback.print_exc(file=f)
