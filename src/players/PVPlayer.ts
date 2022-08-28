export interface PVPlayerOptions {
	onError?(e: any): void;
	onPlay?(): void;
	onPause?(): void;
	onEnded?(): void;
}

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

export interface PVPlayer {
	attach(): Promise<void>;
	detach(): Promise<void>;
	load(pvId: string): Promise<void>;
	play(): void;
	pause(): void;
	seekTo(seconds: number): void;
	setVolume(fraction: number): void;
	mute(): void;
	unmute(): void;
	getCurrentTime(): number | undefined;
}
