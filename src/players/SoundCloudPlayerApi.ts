import React from 'react';

import { PlayerApi, PlayerOptions } from './PlayerApi';
import { PlayerApiImpl } from './PlayerApiImpl';
import { PlayerConsole } from './PlayerConsole';
import { getScript } from './getScript';

// Code from: https://github.com/VocaDB/vocadb/blob/e147650a8f1f85c8fa865d0ab562126c278527ec/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerSoundCloud.ts.
class SoundCloudPlayerApiImpl extends PlayerApiImpl<HTMLIFrameElement> {
	private readonly player: SC.SoundCloudWidget;

	constructor(
		playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		options: PlayerOptions | undefined,
		onReady: () => void,
	) {
		super(playerElementRef, options);

		this.player = SC.Widget(this.playerElementRef.current);

		this.player.bind(SC.Widget.Events.READY, () => {
			this.player.unbind(SC.Widget.Events.READY);

			onReady();
		});
	}

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
			const duration =
				await SoundCloudPlayerApiImpl.playerGetDurationAsync(
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
		await SoundCloudPlayerApiImpl.playerLoadAsync(
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
		const duration = await SoundCloudPlayerApiImpl.playerGetDurationAsync(
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
		const position = await SoundCloudPlayerApiImpl.playerGetPositionAsync(
			this.player,
		);

		return position / 1000;
	};
}

export class SoundCloudPlayerApi implements PlayerApi {
	private static nextId = 1;

	private readonly id: number;
	private impl?: SoundCloudPlayerApiImpl;

	toString = (): string => `SoundCloudPlayerApi#${this.id}`;

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

	private error = (message?: any, ...optionalParams: any): void => {
		PlayerConsole.error(this, message, ...optionalParams);
	};

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		private readonly options?: PlayerOptions,
	) {
		this.id = SoundCloudPlayerApi.nextId++;

		this.debug('ctor');
	}

	private static scriptLoaded = false;

	private loadScript = async (): Promise<void> => {
		if (SoundCloudPlayerApi.scriptLoaded) {
			this.debug('script is already loaded');

			return;
		}

		try {
			this.debug('Loading script...');

			await getScript('https://w.soundcloud.com/player/api.js');

			SoundCloudPlayerApi.scriptLoaded = true;

			this.debug('script loaded');
		} catch (error) {
			this.error('Failed to load script');

			throw error;
		}
	};

	attach = (): Promise<void> => {
		return new Promise(async (resolve, reject /* TODO: Reject. */) => {
			this.debug('attach');

			if (this.impl) {
				this.debug('player is already attached');
				resolve();
				return;
			}

			await this.loadScript();

			this.debug('Attaching player...');

			const impl = new SoundCloudPlayerApiImpl(
				this.playerElementRef,
				this.options,
				async () => {
					await impl.attach();

					this.debug('player attached');
					resolve();
				},
			);
			this.impl = impl;
		});
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.impl, 'player is not attached');
	};

	detach = async (): Promise<void> => {
		this.debug('detach');
		this.assertPlayerAttached();

		await this.impl?.detach();

		this.impl = undefined;
	};

	loadVideo = async (id: string): Promise<void> => {
		this.debug('loadVideo', id);
		this.assertPlayerAttached();

		this.debug('Loading video...');

		await this.impl?.loadVideo(id);

		this.debug('video loaded', id);
	};

	play = async (): Promise<void> => {
		this.debug('play');
		this.assertPlayerAttached();

		await this.impl?.play();
	};

	pause = async (): Promise<void> => {
		this.debug('pause');
		this.assertPlayerAttached();

		await this.impl?.pause();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.debug('setCurrentTime', seconds);
		this.assertPlayerAttached();

		await this.impl?.setCurrentTime(seconds);
	};

	setVolume = async (volume: number): Promise<void> => {
		this.debug('setVolume', volume);
		this.assertPlayerAttached();

		await this.impl?.setVolume(volume);
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.debug('setMuted', muted);
		this.assertPlayerAttached();

		await this.impl?.setMuted(muted);
	};

	getDuration = async (): Promise<number | undefined> => {
		this.debug('getDuration');
		this.assertPlayerAttached();

		return await this.impl?.getDuration();
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		this.debug('getCurrentTime');
		this.assertPlayerAttached();

		return await this.impl?.getCurrentTime();
	};
}
