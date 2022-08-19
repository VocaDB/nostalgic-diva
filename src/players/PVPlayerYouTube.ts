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

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLDivElement>,
		private readonly options: PVPlayerOptions,
	) {
		this.id = PVPlayerYouTube.nextId++;

		PVPlayerConsole.debug(
			`PVPlayerYouTube#${this.id}.ctor`,
			playerElementRef.current,
		);
	}

	private static scriptLoaded = false;

	private loadScript = (): Promise<void> => {
		return new Promise(async (resolve, reject) => {
			if (PVPlayerYouTube.scriptLoaded) {
				PVPlayerConsole.debug('YouTube script is already loaded');

				resolve();
				return;
			}

			// Code from: https://stackoverflow.com/a/18154942.
			window.onYouTubeIframeAPIReady = (): void => {
				PVPlayerConsole.debug('YouTube iframe API ready');

				resolve();
			};

			try {
				PVPlayerConsole.debug('Loading YouTube script...');

				await getScript('https://www.youtube.com/iframe_api');

				PVPlayerYouTube.scriptLoaded = true;

				PVPlayerConsole.debug('YouTube script loaded');
			} catch {
				PVPlayerConsole.error('Failed to load YouTube script');

				reject();
			}
		});
	};

	private assertPlayerAttached = (): void => {
		PVPlayerConsole.assert(!!this.player, 'YouTube player is not attached');
	};

	attach = (): Promise<void> => {
		return new Promise(async (resolve, reject /* TODO: Reject. */) => {
			PVPlayerConsole.debug(`PVPlayerYouTube#${this.id}.attach`);

			if (this.player) {
				PVPlayerConsole.debug('YouTube player is already attached');

				resolve();
				return;
			}

			await this.loadScript();

			PVPlayerConsole.debug('Attaching YouTube player...');

			this.player = new YT.Player(this.playerElementRef.current, {
				host: 'https://www.youtube-nocookie.com',
				width: '100%',
				height: '100%',
				events: {
					onReady: (): void => {
						PVPlayerConsole.debug('YouTube player attached');

						resolve();
					},
					onError: (e): void => this.options.onError?.(e),
					onStateChange: (e: YT.EventArgs): void => {
						this.assertPlayerAttached();
						if (!this.player) return;

						switch (e.data) {
							case YT.PlayerState.PLAYING:
								PVPlayerConsole.debug(
									'YouTube state changed: PLAYING',
								);

								this.options.onPlay?.();
								break;

							case YT.PlayerState.PAUSED:
								PVPlayerConsole.debug(
									'YouTube state changed: PAUSED',
								);

								this.options.onPause?.();
								break;

							case YT.PlayerState.ENDED:
								PVPlayerConsole.debug(
									'YouTube state changed: ENDED',
								);

								this.options.onEnded?.();
								break;
						}
					},
				},
			});
		});
	};

	detach = async (): Promise<void> => {
		PVPlayerConsole.debug(`PVPlayerYouTube#${this.id}.detach`);

		this.player = undefined;
	};

	load = async (pvId: string): Promise<void> => {
		PVPlayerConsole.debug(`PVPlayerYouTube#${this.id}.load`, pvId);

		this.assertPlayerAttached();
		if (!this.player) return;

		PVPlayerConsole.debug('Loading YouTube video...');

		this.player.loadVideoById(pvId);
	};

	play = (): void => {
		PVPlayerConsole.debug(`PVPlayerYouTube#${this.id}.play`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.playVideo();
	};

	pause = (): void => {
		PVPlayerConsole.debug(`PVPlayerYouTube#${this.id}.pause`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.pauseVideo();
	};

	seekTo = (seconds: number): void => {
		PVPlayerConsole.debug(`PVPlayerYouTube#${this.id}.seekTo`, seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.seekTo(seconds);
	};

	setVolume = (fraction: number): void => {
		PVPlayerConsole.debug(`PVPlayerYouTube#${this.id}.setVolume`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.setVolume(fraction * 100);
	};

	mute = (): void => {
		PVPlayerConsole.debug(`PVPlayerYouTube#${this.id}.mute`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.mute();
	};

	unmute = (): void => {
		PVPlayerConsole.debug(`PVPlayerYouTube#${this.id}.unmute`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.unMute();
	};
}
