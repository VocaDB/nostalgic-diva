import { PVPlayer, PVPlayerOptions } from './PVPlayer';
import { PVPlayerConsole } from './PVPlayerConsole';
import { getScript } from './getScript';

declare global {
	interface Window {
		onYouTubeIframeAPIReady(): void;
	}
}

// Code from: https://github.com/VocaDB/vocadb/blob/076dac9f0808aba5da7332209fdfd2ff4e12c235/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerYoutube.ts.
export class PVPlayerYouTube implements PVPlayer {
	private static nextId = 1;

	private readonly id: number;
	private player?: YT.Player;

	toString = (): string => `PVPlayerYouTube#${this.id}`;

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
		private readonly playerElementRef: React.MutableRefObject<HTMLDivElement>,
		private readonly options?: PVPlayerOptions,
	) {
		this.id = PVPlayerYouTube.nextId++;

		this.debug('ctor', playerElementRef.current);
	}

	private static scriptLoaded = false;

	private loadScript = (): Promise<void> => {
		return new Promise(async (resolve, reject) => {
			if (PVPlayerYouTube.scriptLoaded) {
				this.debug('script is already loaded');

				resolve();
				return;
			}

			// Code from: https://stackoverflow.com/a/18154942.
			window.onYouTubeIframeAPIReady = (): void => {
				this.debug('iframe API ready');

				resolve();
			};

			try {
				this.debug('Loading script...');

				await getScript('https://www.youtube.com/iframe_api');

				PVPlayerYouTube.scriptLoaded = true;

				this.debug('script loaded');
			} catch {
				this.error('Failed to load script');

				reject();
			}
		});
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.player, 'player is not attached');
	};

	private timeUpdateIntervalId?: number;

	private clearTimeUpdateInterval = (): void => {
		this.debug('clearTimeUpdateInterval', this.timeUpdateIntervalId);

		window.clearInterval(this.timeUpdateIntervalId);

		this.timeUpdateIntervalId = undefined;
	};

	private previousTime = 0;

	private invokeTimeUpdate = (player: YT.Player): void => {
		const currentTime = player.getCurrentTime();

		if (currentTime === this.previousTime) return;

		const duration = player.getDuration();

		this.options?.onTimeUpdate?.({
			duration: duration,
			percent: currentTime / duration,
			seconds: currentTime,
		});

		this.previousTime = currentTime;
	};

	private setTimeUpdateInterval = (): void => {
		this.debug('setTimeUpdateInterval');

		this.clearTimeUpdateInterval();

		this.assertPlayerAttached();
		if (!this.player) return;

		const player = this.player;

		this.timeUpdateIntervalId = window.setInterval(
			() => this.invokeTimeUpdate(player),
			250,
		);

		this.debug('timeUpdateIntervalId', this.timeUpdateIntervalId);

		this.invokeTimeUpdate(player);
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

			this.player = new YT.Player(this.playerElementRef.current, {
				host: 'https://www.youtube-nocookie.com',
				width: '100%',
				height: '100%',
				events: {
					onReady: (): void => {
						this.debug('player attached');

						resolve();
					},
					onError: (event): void =>
						this.options?.onError?.(event.data),
					onStateChange: (e: YT.EventArgs): void => {
						this.assertPlayerAttached();
						if (!this.player) return;

						switch (e.data) {
							case YT.PlayerState.PLAYING:
								this.debug('state changed: PLAYING');

								this.options?.onPlay?.();

								this.setTimeUpdateInterval();
								break;

							case YT.PlayerState.PAUSED:
								this.debug('state changed: PAUSED');

								this.options?.onPause?.();

								this.clearTimeUpdateInterval();
								break;

							case YT.PlayerState.ENDED:
								this.debug('state changed: ENDED');

								this.options?.onEnded?.();

								this.clearTimeUpdateInterval();
								break;
						}
					},
				},
			});
		});
	};

	detach = async (): Promise<void> => {
		this.debug('detach');

		this.clearTimeUpdateInterval();

		this.player = undefined;
	};

	loadVideo = async (id: string): Promise<void> => {
		this.debug('loadVideo', id);

		this.previousTime = 0;

		this.assertPlayerAttached();
		if (!this.player) return;

		this.debug('Loading video...');

		this.player.loadVideoById(id);
	};

	play = async (): Promise<void> => {
		this.debug('play');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.playVideo();
	};

	pause = async (): Promise<void> => {
		this.debug('pause');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.pauseVideo();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.debug('setCurrentTime', seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		const player = this.player;

		player.seekTo(seconds);

		this.invokeTimeUpdate(player);
	};

	setVolume = async (volume: number): Promise<void> => {
		this.debug('setVolume');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.setVolume(volume * 100);
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.debug('setMuted', muted);

		this.assertPlayerAttached();
		if (!this.player) return;

		if (muted) {
			this.player.mute();
		} else {
			this.player.unMute();
		}
	};

	getDuration = async (): Promise<number | undefined> => {
		this.debug('getDuration');

		this.assertPlayerAttached();
		if (!this.player) return undefined;

		return this.player.getDuration();
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		this.debug('getCurrentTime');

		this.assertPlayerAttached();
		if (!this.player) return undefined;

		return this.player.getCurrentTime();
	};
}
