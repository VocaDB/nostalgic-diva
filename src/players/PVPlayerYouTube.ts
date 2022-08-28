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
					onError: (e): void => this.options?.onError?.(e),
					onStateChange: (e: YT.EventArgs): void => {
						this.assertPlayerAttached();
						if (!this.player) return;

						switch (e.data) {
							case YT.PlayerState.PLAYING:
								this.debug('state changed: PLAYING');

								this.options?.onPlay?.();
								break;

							case YT.PlayerState.PAUSED:
								this.debug('state changed: PAUSED');

								this.options?.onPause?.();
								break;

							case YT.PlayerState.ENDED:
								this.debug('state changed: ENDED');

								this.options?.onEnded?.();
								break;
						}
					},
				},
			});
		});
	};

	detach = async (): Promise<void> => {
		this.debug('detach');

		this.player = undefined;
	};

	load = async (pvId: string): Promise<void> => {
		this.debug('load', pvId);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.debug('Loading video...');

		this.player.loadVideoById(pvId);
	};

	play = (): void => {
		this.debug('play');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.playVideo();
	};

	pause = (): void => {
		this.debug('pause');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.pauseVideo();
	};

	seekTo = (seconds: number): void => {
		this.debug('seekTo', seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.seekTo(seconds);
	};

	setVolume = (fraction: number): void => {
		this.debug('setVolume');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.setVolume(fraction * 100);
	};

	mute = (): void => {
		this.debug('mute');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.mute();
	};

	unmute = (): void => {
		this.debug('unmute');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.unMute();
	};

	getCurrentTime = (): number | undefined => {
		this.debug('getCurrentTime');

		this.assertPlayerAttached();
		if (!this.player) return undefined;

		return this.player.getCurrentTime();
	};
}
