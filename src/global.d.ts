declare namespace nico {
	export interface NicoPlayer {
		iframeElement: HTMLIFrameElement;
		playerId: string;
		play(): void;
		pause(): void;
	}

	export interface NicoPlayerFactory {
		create(element: HTMLElement, watchId: string): Promise<NicoPlayer>;
	}

	export interface PlayerStatusEvent {
		eventName: 'playerStatusChange';
		data: {
			playerStatus: PlayerStatus;
		};
	}

	export interface StatusEvent {
		eventName: 'statusChange';
		data: {
			playerStatus: PlayerStatus;
		};
	}

	export interface MetadataEvent {
		eventName: 'playerMetadataChange';
		data: {
			currentTime: number;
			duration: number;
		};
	}

	export interface LoadCompleteEvent {
		eventName: 'loadComplete';
		data: {
			videoInfo: {
				watchId: string;
				lengthInSeconds: number;
			};
		};
	}

	export interface ErrorEvent {
		eventName: 'error';
		data: {
			message: string;
		};
	}

	export interface PlayerErrorEvent {
		eventName: 'player-error:video:play' | 'player-error:video:seek';
		data: {
			message: string;
		};
	}

	type EventData =
		| PlayerStatusEvent
		| StatusEvent
		| MetadataEvent
		| LoadCompleteEvent
		| ErrorEvent
		| PlayerErrorEvent;

	export interface PlayerEvent {
		origin: string;
		data: EventData;
	}
}

declare namespace SC {
	export const Widget: {
		(iframeElementId: string | HTMLIFrameElement): SoundCloudWidget;
		Events: SoundCloudEvents;
	};

	interface SoundCloudWidget {
		bind(eventName: string, listener: (e: any) => void);
		load(url: string, options: SoundCloudLoadOptions);
		pause();
		play();
		seekTo(milliseconds: number);
		setVolume(volume: number);
		unbind(eventName: string);
		getDuration(callback: (duration: number) => void): void;
		getPosition(callback: (position: number) => void): void;
	}

	interface SoundCloudLoadOptions {
		auto_play?: boolean;

		callback?: () => void;
	}

	interface SoundCloudEvents {
		ERROR: string;
		FINISH: string;
		PAUSE: string;
		PLAY: string;
		READY: string;
		PLAY_PROGRESS: string;
	}
}

// Type definitions for YouTube
// Project: https://developers.google.com/youtube/
// Definitions by: Daz Wilkin <https://github.com/DazWilkin/>, Ian Obermiller <http://ianobermiller.com>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace YT {
	interface EventArgs {
		target: Player;
		data: any;
	}

	interface EventHandler {
		(event: EventArgs): void;
	}

	export interface Events {
		onReady?: EventHandler;
		onPlayback?: EventHandler;
		onStateChange?: EventHandler;
		onError?: EventHandler;
	}

	export enum ListType {
		search,
		user_uploads,
		playlist,
	}

	export interface PlayerVars {
		autohide?: number;
		autoplay?: number;
		cc_load_policy?: any;
		color?: string;
		controls?: number;
		disablekb?: number;
		enablejsapi?: number;
		end?: number;
		fs?: number;
		iv_load_policy?: number;
		list?: string;
		listType?: ListType;
		loop?: number;
		modestbranding?: number;
		origin?: string;
		playerpiid?: string;
		playlist?: string[];
		playsinline?: number;
		rel?: number;
		showinfo?: number;
		start?: number;
		theme?: string;
	}

	export interface PlayerOptions {
		width?: string | number;
		height?: string | number;
		videoId?: string;
		playerVars?: PlayerVars;
		events?: Events;
		host?: string;
	}

	interface VideoByIdParams {
		videoId: string;
		startSeconds?: number;
		endSeconds?: number;
		suggestedQuality?: string;
	}

	interface VideoByUrlParams {
		mediaContentUrl: string;
		startSeconds?: number;
		endSeconds?: number;
		suggestedQuality?: string;
	}

	export interface VideoData {
		video_id: string;
		author: string;
		title: string;
	}

	export class Player {
		// Constructor
		constructor(id: string | HTMLElement, playerOptions: PlayerOptions);

		// Queueing functions
		loadVideoById(
			videoId: string,
			startSeconds?: number,
			suggestedQuality?: string,
		): void;
		loadVideoById(VideoByIdParams: any /* TODO */): void;
		cueVideoById(
			videoId: string,
			startSeconds?: number,
			suggestedQuality?: string,
		): void;
		cueVideoById(VideoByIdParams: any /* TODO */): void;

		loadVideoByUrl(
			mediaContentUrl: string,
			startSeconds?: number,
			suggestedQuality?: string,
		): void;
		loadVideoByUrl(VideoByUrlParams: any /* TODO */): void;
		cueVideoByUrl(
			mediaContentUrl: string,
			startSeconds?: number,
			suggestedQuality?: string,
		): void;
		cueVideoByUrl(VideoByUrlParams: any /* TODO */): void;

		// Properties
		size: any;

		// Playing
		playVideo(): void;
		pauseVideo(): void;
		stopVideo(): void;
		seekTo(seconds: number, allowSeekAhead?: boolean): void;
		clearVideo(): void;

		// Playlist
		nextVideo(): void;
		previousVideo(): void;
		playVideoAt(index: number): void;

		// Volume
		mute(): void;
		unMute(): void;
		isMuted(): boolean;
		setVolume(volume: number): void;
		getVolume(): number;

		// Sizing
		setSize(width: number, height: number): any;

		// Playback
		getPlaybackRate(): number;
		setPlaybackRate(suggestedRate: number): void;
		getAvailablePlaybackRates(): number[];

		// Behavior
		setLoop(loopPlaylists: boolean): void;
		setShuffle(shufflePlaylist: boolean): void;

		// Status
		getVideoLoadedFraction(): number;
		getPlayerState(): number;
		getCurrentTime(): number;
		getVideoStartBytes(): number;
		getVideoBytesLoaded(): number;
		getVideoBytesTotal(): number;

		// Information
		getDuration(): number;
		getVideoUrl(): string;
		getVideoEmbedCode(): string;
		getVideoData(): VideoData;

		// Playlist
		getPlaylist(): any[];
		getPlaylistIndex(): number;

		// Event Listener
		addEventListener(event: string, handler: EventHandler): void;

		// DOM
		destroy(): void;
	}

	export enum PlayerState {
		UNSTARTED,
		BUFFERING,
		CUED,
		ENDED,
		PAUSED,
		PLAYING,
	}
}
