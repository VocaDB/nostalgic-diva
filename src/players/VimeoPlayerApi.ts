import React from 'react';

import { PlayerApi, PlayerOptions } from './PlayerApi';
import { PlayerApiImpl } from './PlayerApiImpl';
import { getScript } from './getScript';

// https://github.com/cookpete/react-player/blob/e3c324bc6845698179d065fa408db515c2296b4b/src/players/Vimeo.js
class VimeoPlayerApiImpl extends PlayerApiImpl<HTMLIFrameElement> {
	private readonly player: Vimeo.Player;

	constructor(
		playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		options: PlayerOptions | undefined,
	) {
		super(playerElementRef, options);

		this.player = new Vimeo.Player(this.playerElementRef.current);
	}

	attach = async (): Promise<void> => {
		await this.player.ready();

		this.player.on('error', (data) => this.options?.onError?.(data));
		this.player.on('play', () => this.options?.onPlay?.());
		this.player.on('pause', () => this.options?.onPause?.());
		this.player.on('ended', () => this.options?.onEnded?.());
		this.player.on('timeupdate', (data) => {
			this.options?.onTimeUpdate?.({
				duration: data.duration,
				percent: data.percent,
				seconds: data.seconds,
			});
		});
	};

	detach = async (): Promise<void> => {
		this.player.off('error');
		this.player.off('play');
		this.player.off('pause');
		this.player.off('ended');
		this.player.off('timeupdate');
	};

	loadVideo = async (id: string): Promise<void> => {
		await this.player.loadVideo(id);
	};

	play = async (): Promise<void> => {
		await this.player.play();
	};

	pause = async (): Promise<void> => {
		await this.player.pause();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		await this.player.setCurrentTime(seconds);
	};

	setVolume = async (fraction: number): Promise<void> => {
		await this.player.setVolume(fraction);
	};

	setMuted = async (muted: boolean): Promise<void> => {
		await this.player.setMuted(muted);
	};

	getDuration = async (): Promise<number | undefined> => {
		return await this.player.getDuration();
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		return await this.player.getCurrentTime();
	};
}

export class VimeoPlayerApi extends PlayerApi<
	HTMLIFrameElement,
	VimeoPlayerApiImpl
> {
	toString = (): string => `VimeoPlayerApi#${this.id}`;

	private static scriptLoaded = false;

	private loadScript = async (): Promise<void> => {
		if (VimeoPlayerApi.scriptLoaded) {
			this.debug('script is already loaded');

			return;
		}

		try {
			this.debug('Loading script...');

			await getScript('https://player.vimeo.com/api/player.js');

			VimeoPlayerApi.scriptLoaded = true;

			this.debug('script loaded');
		} catch (error) {
			this.error('Failed to load script');
			throw error;
		}
	};

	attach = async (): Promise<void> => {
		this.debug('attach');

		if (this.impl) {
			this.debug('player is already attached');
			return;
		}

		await this.loadScript();

		this.debug('Attaching player...');

		this.impl = new VimeoPlayerApiImpl(this.playerElementRef, this.options);

		await this.impl.attach();

		this.debug('player attached');
	};
}
