import { PVPlayer, PVPlayerOptions } from './PVPlayer';
import { PVPlayerConsole } from './PVPlayerConsole';
import { getScript } from './getScript';

// Code from: https://github.com/VocaDB/vocadb/blob/e147650a8f1f85c8fa865d0ab562126c278527ec/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerSoundCloud.ts.
export class PVPlayerSoundCloud implements PVPlayer {
	private static nextId = 1;

	private readonly id: number;
	private player?: SC.SoundCloudWidget;

	toString = (): string => `PVPlayerSoundCloud#${this.id}`;

	private assert = (
		condition?: boolean | undefined,
		message?: any,
		...optionalParams: any
	): void => {
		PVPlayerConsole.assert(condition, this, message, ...optionalParams);
	};

	private debug = (message?: any, ...optionalParams: any): void => {
		PVPlayerConsole.debug(this, message, ...optionalParams);
	};

	private error = (message?: any, ...optionalParams: any): void => {
		PVPlayerConsole.error(this, message, ...optionalParams);
	};

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		private readonly options?: PVPlayerOptions,
	) {
		this.id = PVPlayerSoundCloud.nextId++;

		this.debug('ctor');
	}

	private static scriptLoaded = false;

	private loadScript = (): Promise<void> => {
		return new Promise(async (resolve, reject) => {
			if (PVPlayerSoundCloud.scriptLoaded) {
				this.debug('script is already loaded');

				resolve();
				return;
			}

			try {
				this.debug('Loading script...');

				await getScript('https://w.soundcloud.com/player/api.js');

				PVPlayerSoundCloud.scriptLoaded = true;

				this.debug('script loaded');

				resolve();
			} catch {
				this.error('Failed to load script');

				reject();
			}
		});
	};

	attach = (): Promise<void> => {
		return new Promise(async (resolve, reject /* TODO: Reject. */) => {
			this.debug('attach');

			if (this.player) {
				this.debug('player is already attached');

				resolve();
				return;
			}

			await this.loadScript();

			this.debug('Attaching player...');

			this.player = SC.Widget(this.playerElementRef.current);
			this.player.bind(SC.Widget.Events.READY, () => {
				this.debug('player attached');

				resolve();
			});
			this.player.bind(SC.Widget.Events.ERROR, (e) =>
				this.options?.onError?.(e),
			);
			this.player.bind(SC.Widget.Events.PLAY, () =>
				this.options?.onPlay?.(),
			);
			this.player.bind(SC.Widget.Events.PAUSE, () =>
				this.options?.onPause?.(),
			);
			this.player.bind(SC.Widget.Events.FINISH, () =>
				this.options?.onEnded?.(),
			);
		});
	};

	detach = async (): Promise<void> => {
		this.debug('detach');

		this.player = undefined;
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.player, 'player is not attached');
	};

	private getUrlFromId = (pvId: string): string => {
		const parts = pvId.split(' ');
		const url = `https://api.soundcloud.com/tracks/${parts[0]}`;
		return url;
	};

	load = async (pvId: string): Promise<void> => {
		this.debug('load', pvId);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.debug('Loading video...');

		this.player.load(this.getUrlFromId(pvId), { auto_play: true });
	};

	play = (): void => {
		this.debug('play');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.play();
	};

	pause = (): void => {
		this.debug('pause');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.pause();
	};

	seekTo = (seconds: number): void => {
		this.debug('seekTo', seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.seekTo(seconds * 1000);
	};

	setVolume = (fraction: number): void => {
		this.debug('setVolume');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.setVolume(fraction * 100);
	};

	mute = (): void => {
		this.debug('mute');

		this.setVolume(0);
	};

	unmute = (): void => {
		this.debug('unmute');

		this.setVolume(1 /* TODO */);
	};
}
