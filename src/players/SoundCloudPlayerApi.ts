import React from 'react';

import { Logger, PlayerOptions } from './PlayerApi';
import { PlayerApiImpl } from './PlayerApiImpl';

// Code from: https://github.com/VocaDB/vocadb/blob/e147650a8f1f85c8fa865d0ab562126c278527ec/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerSoundCloud.ts.
export class SoundCloudPlayerApi extends PlayerApiImpl<HTMLIFrameElement> {
	private readonly player: SC.SoundCloudWidget;

	constructor(
		logger: Logger,
		playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		options: PlayerOptions | undefined,
	) {
		super(logger, playerElementRef, options);

		this.player = SC.Widget(this.playerElementRef.current);
	}

	public initialize = async (): Promise<void> => {
		return new Promise((resolve, reject /* TODO: reject */) => {
			this.player.bind(SC.Widget.Events.READY, () => {
				this.player.unbind(SC.Widget.Events.READY);
				resolve();
			});
		});
	};

	private getUrlFromId = (id: string): string => {
		const parts = id.split(' ');
		const url = `https://api.soundcloud.com/tracks/${parts[0]}`;
		return url;
	};

	private static playerGetDurationAsync = (
		player: SC.SoundCloudWidget,
	): Promise<number> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			player.getDuration(resolve);
		});
	};

	attach = async (): Promise<void> => {
		this.player.bind(SC.Widget.Events.ERROR, (event) =>
			this.options?.onError?.(event),
		);
		this.player.bind(SC.Widget.Events.PLAY, () => this.options?.onPlay?.());
		this.player.bind(SC.Widget.Events.PAUSE, () =>
			this.options?.onPause?.(),
		);
		this.player.bind(SC.Widget.Events.FINISH, () =>
			this.options?.onEnded?.(),
		);
		this.player.bind(SC.Widget.Events.PLAY_PROGRESS, async (event) => {
			const duration = await SoundCloudPlayerApi.playerGetDurationAsync(
				this.player,
			);

			this.options?.onTimeUpdate?.({
				duration: duration / 1000,
				percent: event.currentPosition / duration,
				seconds: event.currentPosition / 1000,
			});
		});
	};

	detach = async (): Promise<void> => {
		this.player.unbind(SC.Widget.Events.ERROR);
		this.player.unbind(SC.Widget.Events.PLAY);
		this.player.unbind(SC.Widget.Events.PAUSE);
		this.player.unbind(SC.Widget.Events.FINISH);
		this.player.unbind(SC.Widget.Events.PLAY_PROGRESS);
	};

	private static playerLoadAsync = (
		player: SC.SoundCloudWidget,
		url: string,
		options: Omit<SC.SoundCloudLoadOptions, 'callback'>,
	): Promise<void> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			player.load(url, { ...options, callback: resolve });
		});
	};

	loadVideo = async (id: string): Promise<void> => {
		await SoundCloudPlayerApi.playerLoadAsync(
			this.player,
			this.getUrlFromId(id),
			{
				auto_play: true,
			},
		);
	};

	play = async (): Promise<void> => {
		this.player.play();
	};

	pause = async (): Promise<void> => {
		this.player.pause();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.player.seekTo(seconds * 1000);
	};

	setVolume = async (volume: number): Promise<void> => {
		this.player.setVolume(volume * 100);
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.setVolume(muted ? 0 : 1 /* TODO */);
	};

	getDuration = async (): Promise<number | undefined> => {
		const duration = await SoundCloudPlayerApi.playerGetDurationAsync(
			this.player,
		);

		return duration / 1000;
	};

	private static playerGetPositionAsync = (
		player: SC.SoundCloudWidget,
	): Promise<number> => {
		return new Promise((resolve, reject /* TODO: Reject. */) => {
			player.getPosition(resolve);
		});
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		const position = await SoundCloudPlayerApi.playerGetPositionAsync(
			this.player,
		);

		return position / 1000;
	};
}
