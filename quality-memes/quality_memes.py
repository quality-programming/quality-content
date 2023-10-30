import os
import sys
from pathlib import Path
from tkinter import Button, Canvas, PhotoImage, Tk, Toplevel, messagebox

vlc = None  # Late import


if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
    BUNDLE_PATH = Path(sys._MEIPASS)
else:
    BUNDLE_PATH = Path('.')


def get_resource_path(path):
    return str(BUNDLE_PATH / path)


LIBVLC_DLL_PATH = get_resource_path('libvlc/libvlc.dll')
ASSETS = {
    'icon': get_resource_path('assets/icon.ico'),
    'media': [
        {
            'image': get_resource_path('assets/images/coffin_dance.png'),
            'video': get_resource_path('assets/videos/coffin_dance.mkv')
        },
        {
            'image': get_resource_path('assets/images/gta_san_andreas.png'),
            'video': get_resource_path('assets/videos/gta_san_andreas.mkv')
        },
        {
            'image': get_resource_path('assets/images/soviet_union.png'),
            'video': get_resource_path('assets/videos/soviet_union.mkv')
        },
        {
            'image': get_resource_path('assets/images/wii_trap_remix.png'),
            'video': get_resource_path('assets/videos/wii_trap_remix.mkv')
        },
        {
            'image': get_resource_path('assets/images/renai_circulation.png'),
            'video': get_resource_path('assets/videos/renai_circulation.mkv')
        }
    ]
}


def show_error(message):
    print(message)
    messagebox.showerror('Error', message)


def gui():
    BACKGROUND_COLOR = '#f0f0f0'
    PADDING = 5

    root = Tk()
    root.title('Quality memes for big pp people only')
    root.resizable(False, False)
    root.configure(
        background=BACKGROUND_COLOR,
        padx=PADDING,
        pady=PADDING
    )

    icon_image = PhotoImage(ASSETS['icon'])
    root.iconbitmap(icon_image)

    def player_window(file):
        top = Toplevel(master=root)
        top.configure(background='#FFFFFF')
        top.transient(root)
        top.attributes(
            '-fullscreen', True,
            '-topmost', True
        )
        top.grab_set()
        top.lift()
        top.focus_force()

        def player_exit(*args):
            top.destroy()
            player.stop()

        video = Canvas(
            top,
            bd=0,
            highlightthickness=0,
            cursor='none'
        )
        video.pack(
            expand=True,
            fill='both'
        )

        vlc_instance = vlc.Instance(
            '--input-repeat=999999',
            '--no-video-title-show',
            '--mouse-hide-timeout=0'
        )
        player = vlc_instance.media_player_new()
        media = vlc_instance.media_new(file)
        media.get_mrl()
        player.set_media(media)
        player.set_hwnd(video.winfo_id())
        player.play()

        top.bind('<Escape>', player_exit)
        top.protocol('WM_DELETE_WINDOW', player_exit)

    button_0 = Button(
        root,
        command=lambda: player_window(ASSETS['media'][0]['video']),
        compound='center',
        bg=BACKGROUND_COLOR,
        relief='flat',
        bd=0
    )
    button_0_image = PhotoImage(file=ASSETS['media'][0]['image'])
    button_0.configure(image=button_0_image)
    button_0.grid(row=0, column=0, padx=PADDING, pady=PADDING)

    button_1 = Button(
        root,
        command=lambda: player_window(ASSETS['media'][1]['video']),
        compound='center',
        bg=BACKGROUND_COLOR,
        relief='flat',
        bd=0
    )
    button_1_image = PhotoImage(file=ASSETS['media'][1]['image'])
    button_1.configure(image=button_1_image)
    button_1.grid(row=0, column=1, padx=PADDING, pady=PADDING)

    button_2 = Button(
        root,
        command=lambda: player_window(ASSETS['media'][2]['video']),
        compound='center',
        bg=BACKGROUND_COLOR,
        relief='flat',
        bd=0
    )
    button_2_image = PhotoImage(file=ASSETS['media'][2]['image'])
    button_2.configure(image=button_2_image)
    button_2.grid(row=0, column=2, padx=PADDING, pady=PADDING)

    button_3 = Button(
        root,
        command=lambda: player_window(ASSETS['media'][3]['video']),
        compound='center',
        bg=BACKGROUND_COLOR,
        relief='flat',
        bd=0
    )
    button_3_image = PhotoImage(file=ASSETS['media'][3]['image'])
    button_3.configure(image=button_3_image)
    button_3.grid(row=0, column=3, padx=PADDING, pady=PADDING)

    button_4 = Button(
        root,
        command=lambda: player_window(ASSETS['media'][4]['video']),
        compound='center',
        bg=BACKGROUND_COLOR,
        relief='flat',
        bd=0
    )
    button_4_image = PhotoImage(file=ASSETS['media'][4]['image'])
    button_4.configure(image=button_4_image)
    button_4.grid(row=0, column=4, padx=PADDING, pady=PADDING)

    center_window(root)

    root.mainloop()


def center_window(root):
    root.update()

    geometry = root.geometry()
    size_w, size_h = [int(value) for value in geometry.split('+')[0].split('x')]
    screen_w = root.winfo_screenwidth()
    screen_h = root.winfo_screenheight()

    pos_x = int(screen_w / 2 - size_w / 2)
    pos_y = int(screen_h / 2 - size_h / 2 - 40)

    root.geometry(f'+{pos_x}+{pos_y}')


def main():
    # Validate assets
    if not (
        Path(LIBVLC_DLL_PATH).is_file()  # libVLC
        and Path(ASSETS['icon']).is_file()  # App icon
        and all(Path(media_path).is_file() for media in ASSETS['media'] for media_path in media.values())  # Media files
    ):
        show_error('Missing assets. Please verify that you have extracted the application properly before running.')
        sys.exit(1)

    # Try to import VLC
    os.environ['PYTHON_VLC_LIB_PATH'] = LIBVLC_DLL_PATH
    global vlc
    try:
        import vlc
    except Exception as e:
        show_error(f'Failed to import libVLC: {type(e).__name__}: {e}')
        sys.exit(1)

    gui()


if __name__ == '__main__':
    main()
