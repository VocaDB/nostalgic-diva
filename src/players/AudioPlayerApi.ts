import React from 'react';

import { Logger, PlayerOptions } from './PlayerApi';
import { PlayerApiImpl } from './PlayerApiImpl';

// Code from: https://github.com/VocaDB/vocadb/blob/61b8c54f3eca906a477101dab4fdd9b154be310e/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerFile.ts.
export class AudioPlayerApi extends PlayerApiImpl<HTMLAudioElement> {
	private readonly player: HTMLAudioElement;

	constructor(
		logger: Logger,
		playerElementRef: React.MutableRefObject<HTMLAudioElement>,
		options: PlayerOptions | undefined,
	) {
		super(logger, playerElementRef, options);

		this.player = playerElementRef.current;
	}

	attach = async (): Promise<void> => {
		this.player.onerror = (event): void => this.options?.onError?.(event);
		this.player.onloadeddata = (): void =>
			this.options?.onLoaded?.({ id: this.player.src });
		this.player.onplay = (): void => this.options?.onPlay?.();
		this.player.onpause = (): void => this.options?.onPause?.();
		this.player.onended = (): void => this.options?.onEnded?.();
		this.player.ontimeupdate = (): void => {
			this.options?.onTimeUpdate?.({
				duration: this.player.duration,
				percent: this.player.currentTime / this.player.duration,
				seconds: this.player.currentTime,
			});
		};
	};

	detach = async (): Promise<void> => {
		this.player.onerror = null;
		this.player.onloadeddata = null;
		this.player.onplay = null;
		this.player.onpause = null;
		this.player.onended = null;
		this.player.ontimeupdate = null;
	};

	loadVideo = async (id: string): Promise<void> => {
		this.player.src = id;
	};

	play = async (): Promise<void> => {
		this.player.play();
	};

	pause = async (): Promise<void> => {
		this.player.pause();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.player.currentTime = seconds;
	};

	setVolume = async (volume: number): Promise<void> => {
		this.player.volume = volume;
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.player.muted = muted;
	};

	getDuration = async (): Promise<number | undefined> => {
		return this.player.duration;
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		return this.player.currentTime;
	};
}
