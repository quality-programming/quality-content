import json
import os
import random
import sys
from pathlib import Path
from tkinter import Canvas, PhotoImage, Tk, messagebox

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
    'config': get_resource_path('config.json'),
    'videos': get_resource_path('assets/videos')
}


def show_error(message):
    print(message)
    messagebox.showerror('Error', message)


def main():
    # Validate assets exist
    if not (
        Path(LIBVLC_DLL_PATH).is_file()  # libVLC
        and Path(ASSETS['icon']).is_file()  # App icon
        and Path(ASSETS['config']).is_file()  # Config
        and Path(ASSETS['videos']).is_dir()  # Videos directory
    ):
        show_error('Missing assets. Please verify that you have extracted the application properly before running.')
        sys.exit(1)

    available_videos = [str(item) for item in Path(ASSETS['videos']).iterdir() if item.is_file()]
    if not available_videos:
        show_error('No videos found')
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
        with open(ASSETS['config'], 'rb') as f:
            config = json.load(f)
    except Exception as e:
        show_error(f'Failed to load config: {type(e).__name__}: {e}')
        sys.exit(1)

    try:
        exit_delay = int(config.get('exit_delay', 0))
    except ValueError:
        exit_delay = 0

    root = Tk()
    root.title('Random Video')
    root.resizable(False, False)
    root.attributes(
        '-fullscreen', True,
        '-topmost', True
    )

    icon_image = PhotoImage(ASSETS['icon'])
    root.iconbitmap(icon_image)

    root.grab_set()
    root.lift()
    root.focus_force()

    def play_video(file):
        video = Canvas(
            root,
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

        def app_exit(*args):
            root.destroy()
            player.stop()

        def allow_exit():
            root.bind('<Escape>', app_exit)
            root.protocol('WM_DELETE_WINDOW', app_exit)

        if exit_delay > 0:
            # Prevent closing the window until the specified time has passed
            root.protocol('WM_DELETE_WINDOW', lambda: None)
            root.after(exit_delay * 1000, allow_exit)
        else:
            # Allow closing immediately
            allow_exit()

    selected_video = random.choice(available_videos)
    play_video(selected_video)

    root.mainloop()


if __name__ == '__main__':
    main()
