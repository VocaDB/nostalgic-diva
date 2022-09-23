import React from 'react';

import { PlayerApi, PlayerOptions } from './PlayerApi';
import { PlayerApiImpl } from './PlayerApiImpl';
import { ensureScriptLoaded } from './ensureScriptLoaded';

// https://github.com/cookpete/react-player/blob/e3c324bc6845698179d065fa408db515c2296b4b/src/players/Vimeo.js
class VimeoPlayerApiImpl extends PlayerApiImpl<HTMLIFrameElement> {
	private readonly player: Vimeo.Player;

	constructor(
		playerElementRef: React.MutableRefObject<HTMLIFrameElement>,
		options: PlayerOptions | undefined,
	) {
		super('Vimeo', playerElementRef, options);

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
	attach = async (): Promise<void> => {
		this.debug('attach');

		if (this.impl) {
			this.debug('player is already attached');
			return;
		}

		await ensureScriptLoaded('https://player.vimeo.com/api/player.js');

		this.debug('Attaching player...');

		this.impl = new VimeoPlayerApiImpl(this.playerElementRef, this.options);

		await this.impl.attach();

		this.debug('player attached');
	};
}
