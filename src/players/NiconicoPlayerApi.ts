import React from 'react';

import { Logger, PlayerOptions } from './PlayerApi';
import { PlayerApiImpl } from './PlayerApiImpl';

declare global {
	interface Window {
		onNicoPlayerFactoryReady: (callback: nico.NicoPlayerFactory) => void;
	}
}

enum PlayerStatus {
	Play = 2,
	Pause = 3,
	End = 4,
}

// Code from: https://github.com/VocaDB/vocadb/blob/a4b5f9d8186772d7e6f58f997bbcbb51509d2539/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerNico.ts.
export class NiconicoPlayerApi extends PlayerApiImpl<HTMLIFrameElement> {
	private static readonly origin = 'https://embed.nicovideo.jp';

	private readonly player: HTMLIFrameElement;

	private duration?: number;
	private currentTime?: number;

	constructor(
		logger: Logger,
		playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		videoId: string,
		options: PlayerOptions | undefined,
	) {
		super(logger, playerElementRef, videoId, options);

		this.player = playerElementRef.current;
	}

	private handleMessage = (e: nico.PlayerEvent): void => {
		if (e.origin !== NiconicoPlayerApi.origin) return;

		const data = e.data;

		switch (data.eventName) {
			case 'playerStatusChange':
				this.logger.debug(
					`player status changed: ${
						PlayerStatus[data.data.playerStatus] ??
						data.data.playerStatus
					}`,
				);
				break;

			case 'statusChange':
				this.logger.debug(
					`status changed: ${
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
				this.logger.debug('load completed');

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
				this.logger.debug(
					'message',
					(data as any).eventName,
					(data as any).data,
				);
				break;
		}
	};

	attach = async (): Promise<void> => {
		window.addEventListener('message', this.handleMessage);
	};

	detach = async (): Promise<void> => {
		window.removeEventListener('message', this.handleMessage);
	};

	loadVideo = async (id: string): Promise<void> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			this.duration = undefined;
			this.currentTime = undefined;

			// Wait for iframe to load.
			this.player.onload = (): void => {
				this.player.onload = null;
				resolve();
			};

			this.player.src = `https://embed.nicovideo.jp/watch/${id}?jsapi=1&playerId=1`;
		});
	};

	// Code from: https://blog.hayu.io/web/create/nicovideo-embed-player-api/.
	private postMessage = (message: any): void => {
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
		this.postMessage({ eventName: 'play' });
	};

	pause = async (): Promise<void> => {
		this.postMessage({ eventName: 'pause' });
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.postMessage({ eventName: 'seek', data: { time: seconds * 1000 } });
	};

	setVolume = async (volume: number): Promise<void> => {
		this.postMessage({
			eventName: 'volumeChange',
			data: { volume: volume },
		});
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.postMessage({
			eventName: 'mute',
			data: { mute: muted },
		});
	};

	getDuration = async (): Promise<number | undefined> => {
		return this.duration;
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		return this.currentTime;
	};
}
