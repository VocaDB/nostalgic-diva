import { PlayerApi, PlayerOptions } from './PlayerApi';
import { PlayerConsole } from './PlayerConsole';
import { getScript } from './getScript';

// https://github.com/cookpete/react-player/blob/e3c324bc6845698179d065fa408db515c2296b4b/src/players/Vimeo.js
export class VimeoPlayerApi implements PlayerApi {
	private static nextId = 1;

	private readonly id: number;
	private player?: Vimeo.Player;

	toString = (): string => `VimeoPlayerApi#${this.id}`;

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
		this.id = VimeoPlayerApi.nextId++;

		this.debug('ctor', playerElementRef.current);
	}

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

	private assertPlayerAttached = (): void => {
		this.assert(!!this.player, 'player is not attached');
	};

	attach = async (): Promise<void> => {
		this.debug('attach');

		if (this.player) {
			this.debug('player is already attached');

			return;
		}

		await this.loadScript();

		this.debug('Attaching player...');

		this.player = new Vimeo.Player(this.playerElementRef.current);
		const player = this.player;

		await player.ready();

		player.on('error', (data) => this.options?.onError?.(data));
		player.on('play', () => this.options?.onPlay?.());
		player.on('pause', () => this.options?.onPause?.());
		player.on('ended', () => this.options?.onEnded?.());
		player.on('timeupdate', (data) => {
			this.options?.onTimeUpdate?.({
				duration: data.duration,
				percent: data.percent,
				seconds: data.seconds,
			});
		});

		this.debug('player attached');
	};

	detach = async (): Promise<void> => {
		this.debug('detach');

		this.assertPlayerAttached();
		if (!this.player) return;
		const player = this.player;

		player.off('error');
		player.off('play');
		player.off('pause');
		player.off('ended');
		player.off('timeupdate');

		this.player = undefined;
	};

	loadVideo = async (id: string): Promise<void> => {
		this.debug('loadVideo', id);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.debug('Loading video...');

		await this.player.loadVideo(id);

		this.debug('video loaded', id);
	};

	play = async (): Promise<void> => {
		this.debug('play');

		this.assertPlayerAttached();
		if (!this.player) return;

		await this.player.play();
	};

	pause = async (): Promise<void> => {
		this.debug('pause');

		this.assertPlayerAttached();
		if (!this.player) return;

		await this.player.pause();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.debug('setCurrentTime', seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		await this.player.setCurrentTime(seconds);
	};

	setVolume = async (fraction: number): Promise<void> => {
		this.debug('setVolume', fraction);

		this.assertPlayerAttached();
		if (!this.player) return;

		await this.player.setVolume(fraction);
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.debug('setMuted');

		this.assertPlayerAttached();
		if (!this.player) return;

		await this.player.setMuted(muted);
	};

	getDuration = async (): Promise<number | undefined> => {
		this.debug('getDuration');

		this.assertPlayerAttached();
		if (!this.player) return;

		const duration = await this.player.getDuration();

		return duration;
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		this.debug('getCurrentTime');

		this.assertPlayerAttached();
		if (!this.player) return;

		const currentTime = await this.player.getCurrentTime();

		return currentTime;
	};
}
