import { PlayerApi, PlayerOptions } from './PlayerApi';
import { PlayerConsole } from './PlayerConsole';

declare global {
	interface Window {
		onNicoPlayerFactoryReady: (callback: nico.NicoPlayerFactory) => void;
	}
}

export enum PlayerStatus {
	Play = 2,
	Pause = 3,
	End = 4,
}

// Code from: https://github.com/VocaDB/vocadb/blob/a4b5f9d8186772d7e6f58f997bbcbb51509d2539/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerNico.ts.
export class NiconicoPlayerApi implements PlayerApi {
	private static readonly origin = 'https://embed.nicovideo.jp';

	private static nextId = 1;

	private readonly id: number;
	private player?: HTMLIFrameElement;
	private duration?: number;
	private currentTime?: number;

	toString = (): string => `NiconicoPlayerApi#${this.id}`;

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

	private warn = (message?: any, ...optionalParams: any): void => {
		PlayerConsole.warn(this, message, ...optionalParams);
	};

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		private readonly options?: PlayerOptions,
	) {
		this.id = NiconicoPlayerApi.nextId++;

		this.debug('ctor');
	}

	private handleMessage = (e: nico.PlayerEvent): void => {
		if (e.origin !== NiconicoPlayerApi.origin) return;

		const data = e.data;

		switch (data.eventName) {
			case 'playerStatusChange':
				this.debug(
					`player status changed: ${
						PlayerStatus[data.data.playerStatus] ??
						data.data.playerStatus
					}`,
				);

				switch (data.data.playerStatus) {
					case PlayerStatus.Play:
						this.options?.onPlay?.();
						break;

					case PlayerStatus.Pause:
						this.options?.onPause?.();
						break;

					case PlayerStatus.End:
						this.options?.onEnded?.();
						break;
				}
				break;

			case 'statusChange':
				this.debug(
					`status changed: ${
						PlayerStatus[data.data.playerStatus] ??
						data.data.playerStatus
					}`,
				);
				break;

			case 'playerMetadataChange':
				if (data.data.duration !== undefined)
					this.duration = data.data.duration / 1000;

				this.currentTime =
					data.data.currentTime === undefined
						? undefined
						: data.data.currentTime / 1000;

				this.options?.onTimeUpdate?.({
					duration: this.duration,
					percent:
						this.currentTime !== undefined &&
						this.duration !== undefined
							? this.currentTime / this.duration
							: undefined,
					seconds: this.currentTime,
				});
				break;

			case 'loadComplete':
				this.debug('load completed');

				this.duration = data.data.videoInfo.lengthInSeconds;
				break;

			case 'error':
				// TODO: Implement.

				this.options?.onError?.(data);
				break;

			case 'player-error:video:play':
			case 'player-error:video:seek':
				this.options?.onError?.(data);
				break;

			default:
				this.warn(
					'message',
					(data as any).eventName,
					(data as any).data,
				);
				break;
		}
	};

	attach = async (): Promise<void> => {
		this.debug('attach');

		if (this.player) {
			this.debug('player is already attached');

			return;
		}

		this.player = this.playerElementRef.current;

		window.addEventListener('message', this.handleMessage);

		this.debug('player attached');
	};

	detach = async (): Promise<void> => {
		this.debug('detach');

		this.player = undefined;

		window.removeEventListener('message', this.handleMessage);
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.player, 'player is not attached');
	};

	loadVideo = async (id: string): Promise<void> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			this.debug('loadVideo', id);

			this.duration = undefined;

			this.assertPlayerAttached();
			if (!this.player) return;

			const player = this.player;

			// Wait for iframe to load.
			player.onload = (): void => {
				player.onload = null;

				this.debug('iframe loaded');

				resolve();
			};

			this.player.src = `https://embed.nicovideo.jp/watch/${id}?jsapi=1&playerId=1`;
		});
	};

	// Code from: https://blog.hayu.io/web/create/nicovideo-embed-player-api/.
	private postMessage = (message: any): void => {
		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.contentWindow?.postMessage(
			{
				...message,
				playerId: '1' /* Needs to be a string, not a number. */,
				sourceConnectorType: 1,
			},
			NiconicoPlayerApi.origin,
		);
	};

	play = async (): Promise<void> => {
		this.debug('play');

		this.postMessage({ eventName: 'play' });
	};

	pause = async (): Promise<void> => {
		this.debug('pause');

		this.postMessage({ eventName: 'pause' });
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.debug('setCurrentTime', seconds);

		this.postMessage({ eventName: 'seek', data: { time: seconds * 1000 } });
	};

	setVolume = async (volume: number): Promise<void> => {
		this.debug('setVolume');

		this.postMessage({
			eventName: 'volumeChange',
			data: { volume: volume },
		});
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.debug('setMuted', muted);

		this.postMessage({
			eventName: 'mute',
			data: { mute: muted },
		});
	};

	getDuration = async (): Promise<number | undefined> => {
		this.debug('getDuration');

		this.assertPlayerAttached();
		if (!this.player) return undefined;

		return this.duration;
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		this.debug('getCurrentTime');

		this.assertPlayerAttached();
		if (!this.player) return undefined;

		return this.currentTime;
	};
}
