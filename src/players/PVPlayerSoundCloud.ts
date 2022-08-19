import { PVPlayer, PVPlayerOptions } from './PVPlayer';
import { PVPlayerConsole } from './PVPlayerConsole';
import { getScript } from './getScript';

// Code from: https://github.com/VocaDB/vocadb/blob/e147650a8f1f85c8fa865d0ab562126c278527ec/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerSoundCloud.ts.
export class PVPlayerSoundCloud implements PVPlayer {
	private static nextId = 1;

	private readonly id: number;
	private player?: SC.SoundCloudWidget;

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		private readonly options: PVPlayerOptions,
	) {
		this.id = PVPlayerSoundCloud.nextId++;

		PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.ctor`);
	}

	private static scriptLoaded = false;

	private loadScript = (): Promise<void> => {
		return new Promise(async (resolve, reject) => {
			if (PVPlayerSoundCloud.scriptLoaded) {
				PVPlayerConsole.debug('SoundCloud script is already loaded');

				resolve();
				return;
			}

			try {
				PVPlayerConsole.debug('Loading SoundCloud script...');

				await getScript('https://w.soundcloud.com/player/api.js');

				PVPlayerSoundCloud.scriptLoaded = true;

				PVPlayerConsole.debug('SoundCloud script loaded');

				resolve();
			} catch {
				PVPlayerConsole.error('Failed to load SoundCloud script');

				reject();
			}
		});
	};

	attach = (): Promise<void> => {
		return new Promise(async (resolve, reject /* TODO: Reject. */) => {
			PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.attach`);

			if (this.player) {
				PVPlayerConsole.debug('SoundCloud player is already attached');

				resolve();
				return;
			}

			await this.loadScript();

			PVPlayerConsole.debug('Attaching SoundCloud player...');

			this.player = SC.Widget(this.playerElementRef.current);
			this.player.bind(SC.Widget.Events.READY, () => {
				PVPlayerConsole.debug('SoundCloud player attached');

				resolve();
			});
			this.player.bind(SC.Widget.Events.ERROR, (e) =>
				this.options.onError?.(e),
			);
			this.player.bind(SC.Widget.Events.PLAY, () =>
				this.options.onPlay?.(),
			);
			this.player.bind(SC.Widget.Events.PAUSE, () =>
				this.options.onPause?.(),
			);
			this.player.bind(SC.Widget.Events.FINISH, () =>
				this.options.onEnded?.(),
			);
		});
	};

	detach = async (): Promise<void> => {
		PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.detach`);

		this.player = undefined;
	};

	private assertPlayerAttached = (): void => {
		PVPlayerConsole.assert(
			!!this.player,
			'SoundCloud player is not attached',
		);
	};

	private getUrlFromId = (pvId: string): string => {
		const parts = pvId.split(' ');
		const url = `https://api.soundcloud.com/tracks/${parts[0]}`;
		return url;
	};

	load = async (pvId: string): Promise<void> => {
		PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.load`, pvId);

		this.assertPlayerAttached();
		if (!this.player) return;

		PVPlayerConsole.debug('Loading SoundCloud video...');

		this.player.load(this.getUrlFromId(pvId), { auto_play: true });
	};

	play = (): void => {
		PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.play`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.play();
	};

	pause = (): void => {
		PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.pause`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.pause();
	};

	seekTo = (seconds: number): void => {
		PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.seekTo`, seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.seekTo(seconds * 1000);
	};

	setVolume = (fraction: number): void => {
		PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.setVolume`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.setVolume(fraction * 100);
	};

	mute = (): void => {
		PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.mute`);

		this.setVolume(0);
	};

	unmute = (): void => {
		PVPlayerConsole.debug(`PVPlayerSoundCloud#${this.id}.unmute`);

		this.setVolume(1 /* TODO */);
	};
}
