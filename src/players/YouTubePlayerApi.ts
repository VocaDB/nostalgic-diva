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

const scriptUrl = 'https://www.youtube.com/iframe_api';
let scriptLoaded = false;

const loadScript = (): Promise<void> => {
	return new Promise(async (resolve, reject) => {
		if (scriptLoaded) {
			PlayerConsole.debug(scriptUrl, 'script is already loaded');

			resolve();
			return;
		}

		// Code from: https://stackoverflow.com/a/18154942.
		window.onYouTubeIframeAPIReady = (): void => {
			PlayerConsole.debug(scriptUrl, 'iframe API ready');

			resolve();
		};

		try {
			PlayerConsole.debug(scriptUrl, 'Loading script...');

			await getScript(scriptUrl);

			scriptLoaded = true;

			PlayerConsole.debug(scriptUrl, 'script loaded');
		} catch {
			PlayerConsole.error(scriptUrl, 'Failed to load script');
			reject();
		}
	});
};

export class YouTubePlayerApi extends PlayerApi<
	HTMLDivElement,
	YouTubePlayerApiImpl
> {
	attach = (): Promise<void> => {
		return new Promise(async (resolve, reject /* TODO: Reject. */) => {
			this.debug('attach');

			if (this.impl) {
				this.debug('player is already attached');
				resolve();
				return;
			}

			await loadScript();

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
}
