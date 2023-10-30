import tkinter as tk
import tkinter.ttk as ttk
from tkinter import font, messagebox


class App(tk.Frame):

    def __init__(self, root):
        super().__init__(root)
        self.root = root
        self.root.title('Height Calculator Tool')
        self.root.resizable(False, False)

        default_font = font.nametofont('TkDefaultFont')
        default_font.configure(size=12)
        text_font = font.nametofont('TkTextFont')
        text_font.configure(size=12)

        self.pack(expand=True, fill=tk.BOTH, padx=32, pady=10)
        for i in range(3):
            self.grid_columnconfigure(i, pad=5)
        for i in range(2):
            self.grid_rowconfigure(i, pad=10)

        self.label_height = ttk.Label(self, text='Input your height:')
        self.label_height.grid(row=0, column=0)

        self.spinbox = ttk.Spinbox(self, width=4, from_=0, to=1000, increment=1)
        self.spinbox.set(0)
        self.spinbox.grid(row=0, column=1)

        self.label_cm = ttk.Label(self, text='cm')
        self.label_cm.grid(row=0, column=2)

        self.button = ttk.Button(self, text='Calculate', command=self._calculate_height)
        self.button.grid(row=1, column=0, columnspan=3)

        self._center_window()

    def _calculate_height(self):
        messagebox.showinfo('Result', f'Your height is {self.spinbox.get()} cm!')

    def _center_window(self):
        self.root.update()
        geo = self.root.geometry()
        width, height = [int(i) for i in geo.split('+')[0].split('x')]
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        pos_x = int(screen_width / 2 - width / 2)
        pos_y = int(screen_height / 2 - height / 2)
        self.root.geometry(f'+{pos_x}+{pos_y}')


def main():
    root = tk.Tk()
    app = App(root)
    root.mainloop()


if __name__ == '__main__':
    main()
