export type PlayerType = 'Audio' | 'Niconico' | 'SoundCloud' | 'YouTube';

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

export interface PlayerApi {
	attach(): Promise<void>;
	detach(): Promise<void>;
	loadVideo(id: string): Promise<void>;
	play(): Promise<void>;
	pause(): Promise<void>;
	setCurrentTime(seconds: number): Promise<void>;
	setVolume(volume: number): Promise<void>;
	setMuted(muted: boolean): Promise<void>;
	getDuration(): Promise<number | undefined>;
	getCurrentTime(): Promise<number | undefined>;
}
