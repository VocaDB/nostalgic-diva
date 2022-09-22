import React from 'react';

import { PlayerApi, PlayerOptions } from './PlayerApi';
import { PlayerApiImpl } from './PlayerApiImpl';
import { PlayerConsole } from './PlayerConsole';
import { getScript } from './getScript';

declare global {
	interface Window {
		onYouTubeIframeAPIReady(): void;
	}
}

/* TODO: enum PlayerState {
	UNSTARTED = -1,
	ENDED = 0,
	PLAYING = 1,
	PAUSED = 2,
	BUFFERING = 3,
	CUED = 5,
}*/

// Code from: https://github.com/VocaDB/vocadb/blob/076dac9f0808aba5da7332209fdfd2ff4e12c235/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerYoutube.ts.
class YouTubePlayerApiImpl extends PlayerApiImpl<HTMLDivElement> {
	private readonly player: YT.Player;

	private previousTime?: number;

	private timeUpdateIntervalId?: number;

	private clearTimeUpdateInterval = (): void => {
		// TODO: this.debug('clearTimeUpdateInterval', this.timeUpdateIntervalId);

		window.clearInterval(this.timeUpdateIntervalId);

		this.timeUpdateIntervalId = undefined;
	};

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
		// TODO: this.debug('setTimeUpdateInterval');

		this.clearTimeUpdateInterval();

		this.timeUpdateIntervalId = window.setInterval(
			() => this.invokeTimeUpdate(this.player),
			250,
		);

		// TODO: this.debug('timeUpdateIntervalId', this.timeUpdateIntervalId);

		this.invokeTimeUpdate(this.player);
	};

	constructor(
		playerElementRef: React.MutableRefObject<HTMLDivElement>,
		options: PlayerOptions | undefined,
		onReady: () => void,
	) {
		super(playerElementRef, options);

		this.player = new YT.Player(this.playerElementRef.current, {
			host: 'https://www.youtube-nocookie.com',
			width: '100%',
			height: '100%',
			events: {
				onReady: onReady,
				onError: (event): void => this.options?.onError?.(event.data),
				onStateChange: (e: YT.EventArgs): void => {
					// TODO: this.debug(`state changed: ${PlayerState[e.data]}`);

					switch (e.data) {
						case YT.PlayerState.PLAYING:
							this.options?.onPlay?.();

							this.setTimeUpdateInterval();
							break;

						case YT.PlayerState.PAUSED:
							this.options?.onPause?.();

							this.clearTimeUpdateInterval();
							break;

						case YT.PlayerState.ENDED:
							this.options?.onEnded?.();

							this.clearTimeUpdateInterval();
							break;
					}
				},
			},
		});
	}

	attach = async (): Promise<void> => {};

	detach = async (): Promise<void> => {
		this.clearTimeUpdateInterval();
	};

	loadVideo = async (id: string): Promise<void> => {
		this.previousTime = undefined;

		this.player.loadVideoById(id);
	};

	play = async (): Promise<void> => {
		this.player.playVideo();
	};

	pause = async (): Promise<void> => {
		this.player.pauseVideo();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.player.seekTo(seconds);

		this.invokeTimeUpdate(this.player);
	};

	setVolume = async (volume: number): Promise<void> => {
		this.player.setVolume(volume * 100);
	};

	setMuted = async (muted: boolean): Promise<void> => {
		if (muted) {
			this.player.mute();
		} else {
			this.player.unMute();
		}
	};

	getDuration = async (): Promise<number | undefined> => {
		return this.player.getDuration();
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		return this.player.getCurrentTime();
	};
}

export class YouTubePlayerApi implements PlayerApi {
	private static nextId = 1;

	private readonly id: number;
	private impl?: YouTubePlayerApiImpl;

	toString = (): string => `YouTubePlayerApi#${this.id}`;

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
		private readonly playerElementRef: React.MutableRefObject<HTMLDivElement>,
		private readonly options?: PlayerOptions,
	) {
		this.id = YouTubePlayerApi.nextId++;

		this.debug('ctor', playerElementRef.current);
	}

	private static scriptLoaded = false;

	private loadScript = (): Promise<void> => {
		return new Promise(async (resolve, reject) => {
			if (YouTubePlayerApi.scriptLoaded) {
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

				YouTubePlayerApi.scriptLoaded = true;

				this.debug('script loaded');
			} catch {
				this.error('Failed to load script');
				reject();
			}
		});
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.impl, 'player is not attached');
	};

	attach = (): Promise<void> => {
		return new Promise(async (resolve, reject /* TODO: Reject. */) => {
			this.debug('attach');

			if (this.impl) {
				this.debug('player is already attached');
				resolve();
				return;
			}

			await this.loadScript();

			this.debug('Attaching player...');

			const impl = new YouTubePlayerApiImpl(
				this.playerElementRef,
				this.options,
				async () => {
					await impl.attach();

					this.debug('player attached');
					resolve();
				},
			);
			this.impl = impl;
		});
	};

	detach = async (): Promise<void> => {
		this.debug('detach');
		this.assertPlayerAttached();

		await this.impl?.detach();

		this.impl = undefined;
	};

	loadVideo = async (id: string): Promise<void> => {
		this.debug('loadVideo', id);
		this.assertPlayerAttached();

		this.debug('Loading video...');

		await this.impl?.loadVideo(id);

		this.debug('video loaded', id);
	};

	play = async (): Promise<void> => {
		this.debug('play');
		this.assertPlayerAttached();

		await this.impl?.play();
	};

	pause = async (): Promise<void> => {
		this.debug('pause');
		this.assertPlayerAttached();

		await this.impl?.pause();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.debug('setCurrentTime', seconds);
		this.assertPlayerAttached();

		await this.impl?.setCurrentTime(seconds);
	};

	setVolume = async (volume: number): Promise<void> => {
		this.debug('setVolume', volume);
		this.assertPlayerAttached();

		await this.impl?.setVolume(volume);
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.debug('setMuted', muted);
		this.assertPlayerAttached();

		await this.impl?.setMuted(muted);
	};

	getDuration = async (): Promise<number | undefined> => {
		this.debug('getDuration');
		this.assertPlayerAttached();

		return await this.impl?.getDuration();
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		this.debug('getCurrentTime');
		this.assertPlayerAttached();

		return await this.impl?.getCurrentTime();
	};
}
