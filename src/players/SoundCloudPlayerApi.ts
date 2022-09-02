import { PlayerApi, PlayerOptions } from './PlayerApi';
import { PlayerConsole } from './PlayerConsole';
import { getScript } from './getScript';

// Code from: https://github.com/VocaDB/vocadb/blob/e147650a8f1f85c8fa865d0ab562126c278527ec/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerSoundCloud.ts.
export class SoundCloudPlayerApi implements PlayerApi {
	private static nextId = 1;

	private readonly id: number;
	private player?: SC.SoundCloudWidget;

	toString = (): string => `SoundCloudPlayerApi#${this.id}`;

	private assert = (
		condition?: boolean | undefined,
		message?: any,
		...optionalParams: any
	): void => {
		PlayerConsole.assert(condition, this, message, ...optionalParams);
	};

	private debug = (message?: any, ...optionalParams: any): void => {
		PlayerConsole.debug(this, message, ...optionalParams);
	};

	private error = (message?: any, ...optionalParams: any): void => {
		PlayerConsole.error(this, message, ...optionalParams);
	};

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		private readonly options?: PlayerOptions,
	) {
		this.id = SoundCloudPlayerApi.nextId++;

		this.debug('ctor');
	}

	private static scriptLoaded = false;

	private loadScript = async (): Promise<void> => {
		if (SoundCloudPlayerApi.scriptLoaded) {
			this.debug('script is already loaded');

			return;
		}

		try {
			this.debug('Loading script...');

			await getScript('https://w.soundcloud.com/player/api.js');

			SoundCloudPlayerApi.scriptLoaded = true;

			this.debug('script loaded');
		} catch (error) {
			this.error('Failed to load script');

			throw error;
		}
	};

	private static playerGetDurationAsync = (
		player: SC.SoundCloudWidget,
	): Promise<number> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			player.getDuration(resolve);
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

			const player = this.player;

			player.bind(SC.Widget.Events.READY, () => {
				this.debug('player attached');

				resolve();
			});
			player.bind(SC.Widget.Events.ERROR, (event) =>
				this.options?.onError?.(event),
			);
			player.bind(SC.Widget.Events.PLAY, () => this.options?.onPlay?.());
			player.bind(SC.Widget.Events.PAUSE, () =>
				this.options?.onPause?.(),
			);
			player.bind(SC.Widget.Events.FINISH, () =>
				this.options?.onEnded?.(),
			);
			player.bind(SC.Widget.Events.PLAY_PROGRESS, async (event) => {
				const duration =
					await SoundCloudPlayerApi.playerGetDurationAsync(player);

				this.options?.onTimeUpdate?.({
					duration: duration / 1000,
					percent: event.currentPosition / duration,
					seconds: event.currentPosition / 1000,
				});
			});
		});
	};

	detach = async (): Promise<void> => {
		this.debug('detach');

		this.player = undefined;
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.player, 'player is not attached');
	};

	private getUrlFromId = (id: string): string => {
		const parts = id.split(' ');
		const url = `https://api.soundcloud.com/tracks/${parts[0]}`;
		return url;
	};

	private static playerLoadAsync = (
		player: SC.SoundCloudWidget,
		url: string,
		options: Omit<SC.SoundCloudLoadOptions, 'callback'>,
	): Promise<void> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			player.load(url, { ...options, callback: resolve });
		});
	};

	loadVideo = async (id: string): Promise<void> => {
		this.debug('loadVideo', id);

		this.assertPlayerAttached();
		if (!this.player) return;

		const player = this.player;

		this.debug('Loading video...');

		await SoundCloudPlayerApi.playerLoadAsync(
			player,
			this.getUrlFromId(id),
			{
				auto_play: true,
			},
		);

		this.debug('video loaded');
	};

	play = async (): Promise<void> => {
		this.debug('play');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.play();
	};

	pause = async (): Promise<void> => {
		this.debug('pause');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.pause();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.debug('setCurrentTime', seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.seekTo(seconds * 1000);
	};

	setVolume = async (volume: number): Promise<void> => {
		this.debug('setVolume');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.setVolume(volume * 100);
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.debug('setMuted', muted);

		this.setVolume(muted ? 0 : 1 /* TODO */);
	};

	getDuration = async (): Promise<number | undefined> => {
		this.debug('getDuration');

		this.assertPlayerAttached();
		if (!this.player) return undefined;

		const duration = await SoundCloudPlayerApi.playerGetDurationAsync(
			this.player,
		);

		return duration / 1000;
	};

	private static playerGetPositionAsync = (
		player: SC.SoundCloudWidget,
	): Promise<number> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			player.getPosition(resolve);
		});
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		this.debug('getCurrentTime');

		this.assertPlayerAttached();
		if (!this.player) return undefined;

		const position = await SoundCloudPlayerApi.playerGetPositionAsync(
			this.player,
		);

		return position / 1000;
	};
}
