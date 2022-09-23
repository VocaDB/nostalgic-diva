import React from 'react';

import { IPlayerApi, Logger, PlayerOptions } from './PlayerApi';

export abstract class PlayerApiImpl<TElement extends HTMLElement>
	implements IPlayerApi
{
	protected constructor(
		protected readonly logger: Logger,
		protected readonly playerElementRef: React.MutableRefObject<TElement>,
		protected readonly options: PlayerOptions | undefined,
	) {
		this.logger.debug('ctor', playerElementRef.current);
	}

	abstract initialize(): Promise<void>;
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
