import React from 'react';

import { PlayerOptions } from './PlayerApi';
import { PlayerApiImpl } from './PlayerApiImpl';

declare global {
	interface Window {
		onYouTubeIframeAPIReady(): void;
	}
}

enum PlayerState {
	UNSTARTED = -1,
	ENDED = 0,
	PLAYING = 1,
	PAUSED = 2,
	BUFFERING = 3,
	CUED = 5,
}

// Code from: https://github.com/VocaDB/vocadb/blob/076dac9f0808aba5da7332209fdfd2ff4e12c235/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerYoutube.ts.
export class YouTubePlayerApiImpl extends PlayerApiImpl<HTMLDivElement> {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	private readonly player: YT.Player = undefined! /* HACK */;

	private previousTime?: number;

	private timeUpdateIntervalId?: number;

	private clearTimeUpdateInterval = (): void => {
		this.debug('clearTimeUpdateInterval', this.timeUpdateIntervalId);

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
		this.debug('setTimeUpdateInterval');

		this.clearTimeUpdateInterval();

		this.timeUpdateIntervalId = window.setInterval(
			() => this.invokeTimeUpdate(this.player),
			250,
		);

		this.debug('timeUpdateIntervalId', this.timeUpdateIntervalId);

		this.invokeTimeUpdate(this.player);
	};

	constructor(
		playerElementRef: React.MutableRefObject<HTMLDivElement>,
		options: PlayerOptions | undefined,
	) {
		super('YouTube', playerElementRef, options);
	}

	initialize = async (): Promise<void> => {
		return new Promise((resolve, reject /* TODO: reject */) => {
			// HACK
			(this as any).player = new YT.Player(
				this.playerElementRef.current,
				{
					host: 'https://www.youtube-nocookie.com',
					width: '100%',
					height: '100%',
					events: {
						onReady: (): void => resolve(),
						onError: (event): void =>
							this.options?.onError?.(event.data),
						onStateChange: (e: YT.EventArgs): void => {
							this.debug(`state changed: ${PlayerState[e.data]}`);

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
				},
			);
		});
	};

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
