import React from 'react';

import { PlayerApiImpl } from './PlayerApiImpl';
import { PlayerConsole } from './PlayerConsole';

export type PlayerType =
	| 'Audio'
	| 'Niconico'
	| 'SoundCloud'
	| 'Vimeo'
	| 'YouTube';

export interface TimeEvent {
	duration: number | undefined;
	percent: number | undefined;
	seconds: number | undefined;
}

export interface PlayerOptions {
	onError?(event: any): void;
	onPlay?(): void;
	onPause?(): void;
	onEnded?(): void;
	onTimeUpdate?(event: TimeEvent): void;
}

export interface IPlayerApi {
	loadVideo(id: string): Promise<void>;
	play(): Promise<void>;
	pause(): Promise<void>;
	setCurrentTime(seconds: number): Promise<void>;
	setVolume(volume: number): Promise<void>;
	setMuted(muted: boolean): Promise<void>;
	getDuration(): Promise<number | undefined>;
	getCurrentTime(): Promise<number | undefined>;
}

export interface Logger {
	debug(message?: any, ...optionalParams: any): void;
	error(message?: any, ...optionalParams: any): void;
}

export class PlayerApi<
	TElement extends HTMLElement,
	TPlayer extends PlayerApiImpl<TElement>,
> implements IPlayerApi, Logger
{
	private static nextId = 1;

	private readonly id: number;
	private impl?: TPlayer;

	constructor(
		private readonly type: PlayerType,
		private readonly playerElementRef: React.MutableRefObject<TElement>,
		private readonly options: PlayerOptions | undefined,
		private readonly loadScript: (() => Promise<void>) | undefined,
		private readonly playerApiFactory: new (
			logger: Logger,
			playerElementRef: React.MutableRefObject<TElement>,
			options: PlayerOptions | undefined,
		) => TPlayer,
	) {
		this.id = PlayerApi.nextId++;
	}

	private createMessage = (message: any): string => {
		return `${this.type}#${this.id} ${message}`;
	};

	public debug = (message?: any, ...optionalParams: any): void => {
		PlayerConsole.debug(this.createMessage(message), ...optionalParams);
	};

	public error = (message?: any, ...optionalParams: any): void => {
		PlayerConsole.error(this.createMessage(message), ...optionalParams);
	};

	attach = async (): Promise<void> => {
		this.debug('attach');

		if (this.impl) {
			this.debug('player is already attached');
			return;
		}

		await this.loadScript?.();

		this.debug('Attaching player...');

		this.impl = new this.playerApiFactory(
			this,
			this.playerElementRef,
			this.options,
		);

		await this.impl.attach();

		this.debug('player attached');
	};

	private assertPlayerAttached = (): void => {
		PlayerConsole.assert(!!this.impl, 'player is not attached');
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
