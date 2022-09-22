import React from 'react';

import { PlayerApi, PlayerOptions } from './PlayerApi';
import { PlayerApiImpl } from './PlayerApiImpl';
import { PlayerConsole } from './PlayerConsole';

// Code from: https://github.com/VocaDB/vocadb/blob/61b8c54f3eca906a477101dab4fdd9b154be310e/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerFile.ts.
class AudioPlayerApiImpl extends PlayerApiImpl<HTMLAudioElement> {
	private readonly player: HTMLAudioElement;

	constructor(
		playerElementRef: React.MutableRefObject<HTMLAudioElement>,
		options: PlayerOptions | undefined,
	) {
		super(playerElementRef, options);

		this.player = playerElementRef.current;
	}

	attach = async (): Promise<void> => {
		this.player.onerror = (event): void => this.options?.onError?.(event);
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

export class AudioPlayerApi implements PlayerApi {
	private static nextId = 1;

	private readonly id: number;
	private impl?: AudioPlayerApiImpl;

	toString = (): string => `AudioPlayerApi#${this.id}`;

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

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLAudioElement>,
		private readonly options?: PlayerOptions,
	) {
		this.id = AudioPlayerApi.nextId++;

		this.debug('ctor');
	}

	attach = async (): Promise<void> => {
		this.debug('attach');

		if (this.impl) {
			this.debug('player is already attached');
			return;
		}

		this.impl = new AudioPlayerApiImpl(this.playerElementRef, this.options);

		await this.impl.attach();

		this.debug('player attached');
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.impl, 'player is not attached');
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
