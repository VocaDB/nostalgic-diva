import qs from 'qs';

import { PVPlayer, PVPlayerOptions } from './PVPlayer';
import { PVPlayerConsole } from './PVPlayerConsole';

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
export class PVPlayerNiconico implements PVPlayer {
	private static readonly origin = 'https://embed.nicovideo.jp';

	private static nextId = 1;

	private readonly id: number;
	private player?: HTMLIFrameElement;

	toString = (): string => `PVPlayerNiconico#${this.id}`;

	private assert = (
		condition?: boolean | undefined,
		message?: any,
		...optionalParams: any
	): void => {
		PVPlayerConsole.assert(condition, this, message, ...optionalParams);
	};

	private debug = (message?: any, ...optionalParams: any): void => {
		PVPlayerConsole.debug(this, message, ...optionalParams);
	};

	private warn = (message?: any, ...optionalParams: any): void => {
		PVPlayerConsole.warn(this, message, ...optionalParams);
	};

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		private readonly options: PVPlayerOptions,
	) {
		this.id = PVPlayerNiconico.nextId++;

		this.debug(`ctor`);
	}

	private handleMessage = (e: nico.PlayerEvent): void => {
		if (e.origin !== PVPlayerNiconico.origin) return;

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
						this.options.onPlay?.();
						break;

					case PlayerStatus.Pause:
						this.options.onPause?.();
						break;

					case PlayerStatus.End:
						this.options.onEnded?.();
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
				break;

			case 'loadComplete':
				this.debug(`load completed`);

				// TODO: Implement.
				break;

			case 'error':
				// TODO: Implement.

				this.options.onError?.(data);
				break;

			case 'player-error:video:play':
			case 'player-error:video:seek':
				this.options.onError?.(data);
				break;

			default:
				this.warn(
					`message`,
					(data as any).eventName,
					(data as any).data,
				);
				break;
		}
	};

	attach = (): Promise<void> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			this.debug(`attach`);

			if (this.player) {
				this.debug(`player is already attached`);

				resolve();
				return;
			}

			this.player = this.playerElementRef.current;

			window.addEventListener('message', this.handleMessage);

			this.debug(`player attached`);

			resolve();
		});
	};

	detach = async (): Promise<void> => {
		this.debug(`detach`);

		this.player = undefined;

		window.removeEventListener('message', this.handleMessage);
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.player, `player is not attached`);
	};

	load = async (pvId: string): Promise<void> => {
		return new Promise(async (resolve, reject /* TODO: Reject. */) => {
			this.debug(`load`, pvId);

			this.assertPlayerAttached();
			if (!this.player) return;

			// Wait for iframe to load.
			this.player.onload = (): void => {
				this.assertPlayerAttached();
				if (!this.player) return;

				this.player.onload = null;

				this.debug(`iframe loaded`);

				resolve();
			};

			this.player.src = `https://embed.nicovideo.jp/watch/${pvId}?${qs.stringify(
				{
					jsapi: 1,
					playerId: 1,
				},
			)}`;
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
			PVPlayerNiconico.origin,
		);
	};

	play = (): void => {
		this.debug(`play`);

		this.postMessage({ eventName: 'play' });
	};

	pause = (): void => {
		this.debug(`pause`);

		this.postMessage({ eventName: 'pause' });
	};

	seekTo = (seconds: number): void => {
		this.debug(`seekTo`, seconds);

		this.postMessage({ eventName: 'seek', data: { time: seconds * 1000 } });
	};

	setVolume = (fraction: number): void => {
		this.debug(`setVolume`);

		this.postMessage({
			eventName: 'volumeChange',
			data: { volume: fraction },
		});
	};

	mute = (): void => {
		this.debug(`mute`);

		this.postMessage({
			eventName: 'mute',
			data: { mute: true },
		});
	};

	unmute = (): void => {
		this.debug(`unmute`);

		this.postMessage({
			eventName: 'mute',
			data: { mute: false },
		});
	};
}
