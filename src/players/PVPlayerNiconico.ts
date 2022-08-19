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

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		private readonly options: PVPlayerOptions,
	) {
		this.id = PVPlayerNiconico.nextId++;

		PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.ctor`);
	}

	private handleMessage = (e: nico.PlayerEvent): void => {
		if (e.origin !== PVPlayerNiconico.origin) return;

		const data = e.data;

		switch (data.eventName) {
			case 'playerStatusChange':
				PVPlayerConsole.debug(
					`Niconico player status changed: ${
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
				PVPlayerConsole.debug(
					`Niconico status changed: ${
						PlayerStatus[data.data.playerStatus] ??
						data.data.playerStatus
					}`,
				);
				break;

			case 'playerMetadataChange':
				break;

			case 'loadComplete':
				PVPlayerConsole.debug('Niconico load completed');

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
				PVPlayerConsole.warn(
					'Niconico message',
					(data as any).eventName,
					(data as any).data,
				);
				break;
		}
	};

	attach = (): Promise<void> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.attach`);

			if (this.player) {
				PVPlayerConsole.debug('Niconico player is already attached');

				resolve();
				return;
			}

			this.player = this.playerElementRef.current;

			window.addEventListener('message', this.handleMessage);

			PVPlayerConsole.debug('Niconico player attached');

			resolve();
		});
	};

	detach = async (): Promise<void> => {
		PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.detach`);

		this.player = undefined;

		window.removeEventListener('message', this.handleMessage);
	};

	private assertPlayerAttached = (): void => {
		PVPlayerConsole.assert(
			!!this.player,
			'Niconico player is not attached',
		);
	};

	load = async (pvId: string): Promise<void> => {
		return new Promise(async (resolve, reject /* TODO: Reject. */) => {
			PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.load`, pvId);

			this.assertPlayerAttached();
			if (!this.player) return;

			// Wait for iframe to load.
			this.player.onload = (): void => {
				this.assertPlayerAttached();
				if (!this.player) return;

				this.player.onload = null;

				PVPlayerConsole.debug('Niconico iframe loaded');

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
		PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.play`);

		this.postMessage({ eventName: 'play' });
	};

	pause = (): void => {
		PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.pause`);

		this.postMessage({ eventName: 'pause' });
	};

	seekTo = (seconds: number): void => {
		PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.seekTo`, seconds);

		this.postMessage({ eventName: 'seek', data: { time: seconds * 1000 } });
	};

	setVolume = (fraction: number): void => {
		PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.setVolume`);

		this.postMessage({
			eventName: 'volumeChange',
			data: { volume: fraction },
		});
	};

	mute = (): void => {
		PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.mute`);

		this.postMessage({
			eventName: 'mute',
			data: { mute: true },
		});
	};

	unmute = (): void => {
		PVPlayerConsole.debug(`PVPlayerNiconico#${this.id}.unmute`);

		this.postMessage({
			eventName: 'mute',
			data: { mute: false },
		});
	};
}
