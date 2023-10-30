import json
import math
import os
import screeninfo
import sys
import tkinter as tk
from functools import partial
from pathlib import Path
from tkinter import messagebox

vlc = None  # Late import


if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
    BUNDLE_PATH = Path(sys._MEIPASS)
else:
    BUNDLE_PATH = Path('.')


def get_resource_path(asset):
    return str(BUNDLE_PATH / asset)


LIBVLC_DLL_PATH = get_resource_path('libvlc/libvlc.dll')
ASSETS = {
    'icon': get_resource_path('assets/icon.ico'),
    'config': get_resource_path('config.json')
}


def show_error(message):
    print(message)
    messagebox.showerror('Error', message)


class App(tk.Frame):

    def __init__(self, root, media):
        super().__init__(root)
        self.pack(fill=tk.BOTH, expand=True)
        self.root = root
        self.media = media
        self.players = []

        self.root.title('Ultimate Pro Quality')
        self.root.resizable(False, False)
        self.root.lift()
        self.root.focus_force()

        self.set_icon()
        self.init_widgets()
        self.center_window(self.root, offset_y=-40)

    def set_icon(self):
        icon_image = tk.PhotoImage(ASSETS['icon'])
        self.root.iconbitmap(icon_image)

    def init_widgets(self):
        media_count = len(self.media)
        max_columns = sum(divmod(media_count, math.floor(math.sqrt(media_count))))

        row = 0
        column = 0

        for media_entry in self.media:
            if column >= max_columns:
                row += 1
                column = 0

            image = tk.PhotoImage(file=media_entry['image'])
            button = tk.Button(
                self,
                command=partial(self.open_players, media_entry['video']),
                image=image,
                compound=tk.CENTER,
                relief=tk.FLAT,
                bd=0,
                highlightthickness=0
            )
            button._image = image
            button.grid(row=row, column=column)

            column += 1

    def center_window(self, root, offset_x=0, offset_y=0):
        root.update()
        geometry = root.geometry()
        width, height = [int(i) for i in geometry.split('+')[0].split('x')]
        screen_width = root.winfo_screenwidth()
        screen_height = root.winfo_screenheight()
        pos_x = int(screen_width / 2 - width / 2 + offset_x)
        pos_y = int(screen_height / 2 - height / 2 + offset_y)
        root.geometry(f'+{pos_x}+{pos_y}')

    def open_players(self, file):
        monitors = screeninfo.get_monitors()
        if len(monitors) > 1:
            mute = False
            for m in monitors:
                player = Player(
                    self.root,
                    m.width,
                    m.height,
                    m.x,
                    m.y,
                    False,
                    mute,
                    file,
                    self.exit_players
                )
                self.players.append(player)
                mute = True
        else:
            player = Player(
                self.root,
                self.root.winfo_screenwidth(),
                self.root.winfo_screenheight(),
                0,
                0,
                True,
                False,
                file,
                self.exit_players
            )
            self.players.append(player)

        for p in self.players:
            p.play()

    def exit_players(self, *args):
        for p in self.players:
            p.exit()
        self.players.clear()


class Player:

    def __init__(
        self, root, width, height, pos_x,
        pos_y, fullscreen, mute, file, exit_cb
    ):
        self.root = root
        self.width = width
        self.height = height
        self.pos_x = pos_x
        self.pos_y = pos_y
        self.fullscreen = fullscreen
        self.mute = mute
        self.file = file
        self.exit_cb = exit_cb
        self.options = [
            '--input-repeat=999999',
            '--no-video-title-show',
            '--mouse-hide-timeout=0',
        ]
        if self.mute:
            self.options.append('--no-audio')
        self.vlc_instance = vlc.Instance(self.options)
        self.window = None
        self.player = None

        self.create_window()

    def create_window(self):
        self.window = tk.Toplevel(self.root, cursor=tk.NONE)
        self.window.attributes('-topmost', True)
        if self.fullscreen:
            self.window.attributes('-fullscreen', True)
        self.window.overrideredirect(True)
        self.window.grab_set()
        self.window.lift()
        self.window.focus_force()
        self.window.geometry('{}x{}+{}+{}'.format(
            self.width,
            self.height,
            self.pos_x,
            self.pos_y
        ))

        canvas = tk.Canvas(self.window, cursor=tk.NONE)
        canvas.pack(fill=tk.BOTH, expand=True)

        media = self.vlc_instance.media_new(self.file)
        self.player = self.vlc_instance.media_player_new()
        self.player.set_hwnd(canvas.winfo_id())
        self.player.set_media(media)

        self.window.bind('<Escape>', self.exit_cb)
        self.window.protocol('WM_DELETE_WINDOW', self.exit_cb)

    def play(self):
        self.player.play()

    def exit(self):
        self.window.destroy()
        self.player.stop()
        self.vlc_instance.release()


def main():
    # Validate assets exist
    if not (
        Path(LIBVLC_DLL_PATH).is_file()  # libVLC
        and Path(ASSETS['icon']).is_file()  # App icon
        and Path(ASSETS['config']).is_file()  # Config
    ):
        show_error('Missing assets. Please verify that you have extracted the application properly before running.')
        sys.exit(1)

    # Load config
    try:
        with open(ASSETS['config'], 'rb') as f:
            config = json.load(f)
    except Exception as e:
        show_error(f'Failed to load config: {type(e).__name__}: {e}')
        sys.exit(1)

    media = []
    try:
        if len(config['media']) == 0:
            raise RuntimeError

        for media_entry in config['media']:
            image_path = get_resource_path(media_entry['image'])
            video_path = get_resource_path(media_entry['video'])

            if not Path(image_path).is_file() or not Path(video_path).is_file():
                show_error('Missing assets. Please verify that you have extracted the application properly before running.')
                sys.exit(1)

            media.append({
                'image': image_path,
                'video': video_path
            })
    except Exception:
        show_error('Invalid configuration')
        sys.exit(1)

    # Try to import VLC
    os.environ['PYTHON_VLC_LIB_PATH'] = LIBVLC_DLL_PATH
    global vlc
    try:
        import vlc
    except Exception as e:
        show_error(f'Failed to import libVLC: {type(e).__name__}: {e}')
        sys.exit(1)

    try:
        root = tk.Tk()
        app = App(root, media)
        root.mainloop()
    except Exception as e:
        show_error(f'{type(e).__name__}: {e}')


if __name__ == '__main__':
    main()
