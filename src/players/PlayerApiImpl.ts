import React from 'react';

import { PlayerOptions, PlayerType } from './PlayerApi';
import { PlayerConsole } from './PlayerConsole';

export abstract class PlayerApiImpl<TElement extends HTMLElement> {
	private static nextId = 1;

	protected readonly id: number;

	toString = (): string => `${this.playerType}#${this.id}`;

	public debug = (message?: any, ...optionalParams: any): void => {
		PlayerConsole.debug(this, message, ...optionalParams);
	};

	public error = (message?: any, ...optionalParams: any): void => {
		PlayerConsole.error(this, message, ...optionalParams);
	};

	constructor(
		protected readonly playerType: PlayerType,
		protected readonly playerElementRef: React.MutableRefObject<TElement>,
		protected readonly options: PlayerOptions | undefined,
	) {
		this.id = PlayerApiImpl.nextId++;

		this.debug('ctor', playerElementRef.current);
	}

	abstract attach(): Promise<void>;
	abstract detach(): Promise<void>;
	abstract loadVideo(id: string): Promise<void>;
	abstract play(): Promise<void>;
	abstract pause(): Promise<void>;
	abstract setCurrentTime(seconds: number): Promise<void>;
	abstract setVolume(volume: number): Promise<void>;
	abstract setMuted(muted: boolean): Promise<void>;
	abstract getDuration(): Promise<number | undefined>;
	abstract getCurrentTime(): Promise<number | undefined>;
}
