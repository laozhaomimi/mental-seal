import customtkinter as ctk
import sys, traceback

try:
    app = ctk.CTk()
    app.title("test")
    app.geometry("200x100+100+100")
    ctk.CTkLabel(app, text="OK").pack()
    app.after(3000, app.destroy)  # 3秒后自动关闭
    app.mainloop()
except Exception as e:
    with open("test_error.log", "w") as f:
        traceback.print_exc(file=f)
