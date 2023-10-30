import sys
import webbrowser
import winsound
from pathlib import Path
from tkinter import Tk, Button, PhotoImage, font, messagebox


if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
    BUNDLE_PATH = Path(sys._MEIPASS)
else:
    BUNDLE_PATH = Path('.')


def get_resource_path(path):
    return str(BUNDLE_PATH / path)


ASSETS = {
    'icon': get_resource_path('assets/icon.ico'),
    'bruh-image': get_resource_path('assets/bruh.png'),
    'bruh-sound': get_resource_path('assets/bruh.wav')
}


def show_error(message):
    print(message)
    messagebox.showerror('Error', message)


def gui():
    # Validate assets
    if not (
        Path(ASSETS['icon']).is_file()
        and Path(ASSETS['bruh-image']).is_file()
        and Path(ASSETS['bruh-sound']).is_file()
    ):
        show_error('Missing assets. Please verify that you have extracted the application properly before running.')
        sys.exit(1)

    root = Tk()
    root.title('𝘽 𝙍 𝙐 𝙃')
    root.resizable(False, False)

    icon_image = PhotoImage(ASSETS['icon'])
    root.iconbitmap(icon_image)

    def on_click():
        winsound.PlaySound(ASSETS['bruh-sound'], winsound.SND_FILENAME | winsound.SND_ASYNC)
        messagebox.showerror(
            '𝘽 𝙍 𝙐 𝙃 moment',
            'The application has encountered an unexpected 𝘽 𝙍 𝙐 𝙃 moment'
        )
        webbrowser.open('https://www.youtube.com/watch?v=DpXIXXXLJvc')

    button_image = PhotoImage(file=ASSETS['bruh-image'])
    button_font = font.nametofont('TkDefaultFont')
    button_font.configure(size=60, weight='bold')
    button = Button(
        root,
        text='bruh',
        font=button_font,
        image=button_image,
        relief='flat',
        border=0,
        compound='center',
        command=on_click
    )
    button.pack()

    root.mainloop()


if __name__ == '__main__':
    gui()
