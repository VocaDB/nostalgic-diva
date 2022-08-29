export enum PVService {
	Niconico = 'NicoNicoDouga',
	YouTube = 'Youtube',
	SoundCloud = 'SoundCloud',
	//Vimeo = 'Vimeo',
	//Piapro = 'Piapro',
	//Bilibili = 'Bilibili',
	File = 'File',
	LocalFile = 'LocalFile',
	//Creofuga = 'Creofuga',
	//Bandcamp = 'Bandcamp',
}

export interface PVPlayerOptions {
	onError?(event: any): void;
	onPlay?(): void;
	onPause?(): void;
	onEnded?(): void;
	onTimeUpdate?(event: {
		duration: number | undefined;
		percent: number | undefined;
		seconds: number | undefined;
	}): void;
}

export interface PVPlayer {
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
