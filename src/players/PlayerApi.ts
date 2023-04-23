import React from 'react';

import { PlayerApiImpl } from './PlayerApiImpl';
import { PlayerConsole } from './PlayerConsole';

export type PlayerType =
	| 'Audio'
	| 'Niconico'
	| 'SoundCloud'
	| 'Vimeo'
	| 'YouTube';

export interface LoadedEvent {
	id: string;
}

export interface TimeEvent {
	duration: number | undefined;
	percent: number | undefined;
	seconds: number | undefined;
}

export interface PlayerOptions {
	onError?(event: any): void;
	onLoaded?(event: LoadedEvent): void;
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

	private createMessage(message: any): string {
		return `${this.type}#${this.id} ${message}`;
	}

	public debug(message?: any, ...optionalParams: any): void {
		PlayerConsole.debug(this.createMessage(message), ...optionalParams);
	}

	public error(message?: any, ...optionalParams: any): void {
		PlayerConsole.error(this.createMessage(message), ...optionalParams);
	}

	async attach(id: string): Promise<void> {
		this.debug('attach', id);

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

		await this.impl.attach(id);

		this.debug('player attached');
	}

	private createPlayerNotAttachedError(): Error {
		return new Error('player is not attached');
	}

	async detach(): Promise<void> {
		this.debug('detach');

		if (this.impl === undefined) {
			throw this.createPlayerNotAttachedError();
		}

		await this.impl.detach();

		this.impl = undefined;
	}

	async loadVideo(id: string): Promise<void> {
		this.debug('loadVideo', id);

		if (this.impl === undefined) {
			throw this.createPlayerNotAttachedError();
		}

		this.debug('Loading video...');

		await this.impl.loadVideo(id);

		this.debug('video loaded', id);
	}

	play(): Promise<void> {
		this.debug('play');

		if (this.impl === undefined) {
			throw this.createPlayerNotAttachedError();
		}

		return this.impl.play();
	}

	pause(): Promise<void> {
		this.debug('pause');

		if (this.impl === undefined) {
			throw this.createPlayerNotAttachedError();
		}

		return this.impl.pause();
	}

	setCurrentTime(seconds: number): Promise<void> {
		this.debug('setCurrentTime', seconds);

		if (this.impl === undefined) {
			throw this.createPlayerNotAttachedError();
		}

		return this.impl.setCurrentTime(seconds);
	}

	setVolume(volume: number): Promise<void> {
		this.debug('setVolume', volume);

		if (this.impl === undefined) {
			throw this.createPlayerNotAttachedError();
		}

		return this.impl.setVolume(volume);
	}

	setMuted(muted: boolean): Promise<void> {
		this.debug('setMuted', muted);

		if (this.impl === undefined) {
			throw this.createPlayerNotAttachedError();
		}

		return this.impl.setMuted(muted);
	}

	getDuration(): Promise<number | undefined> {
		this.debug('getDuration');

		if (this.impl === undefined) {
			throw this.createPlayerNotAttachedError();
		}

		return this.impl.getDuration();
	}

	getCurrentTime(): Promise<number | undefined> {
		this.debug('getCurrentTime');

		if (this.impl === undefined) {
			throw this.createPlayerNotAttachedError();
		}

		return this.impl.getCurrentTime();
	}
}
