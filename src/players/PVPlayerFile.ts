import { PVPlayer, PVPlayerOptions } from './PVPlayer';
import { PVPlayerConsole } from './PVPlayerConsole';

// Code from: https://github.com/VocaDB/vocadb/blob/61b8c54f3eca906a477101dab4fdd9b154be310e/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerFile.ts.
export class PVPlayerFile implements PVPlayer {
	private static nextId = 1;

	private readonly id: number;
	private player?: HTMLAudioElement;

	toString = (): string => `PVPlayerFile#${this.id}`;

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

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLAudioElement>,
		private readonly options?: PVPlayerOptions,
	) {
		this.id = PVPlayerFile.nextId++;

		this.debug('ctor');
	}

	attach = async (): Promise<void> => {
		this.debug('attach');

		if (this.player) {
			this.debug('player is already attached');
			return;
		}

		this.player = this.playerElementRef.current;

		this.debug('player attached');
	};

	detach = async (): Promise<void> => {
		this.debug('detach');

		this.player = undefined;
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.player, 'player is not attached');
	};

	loadVideo = async (id: string): Promise<void> => {
		this.debug('loadVideo', id);

		this.assert(!!id, 'id is not defined');
		if (!id) return;

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.src = id;

		// REVIEW: Do we need to remove event listeners before removing the player element?
		this.player.onplay = (): void => this.options?.onPlay?.();
		this.player.onpause = (): void => this.options?.onPause?.();
		this.player.onended = (): void => this.options?.onEnded?.();
	};

	play = async (): Promise<void> => {
		this.debug('play');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.play();
	};

	pause = async (): Promise<void> => {
		this.debug('pause');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.pause();
	};

	setCurrentTime = async (seconds: number): Promise<void> => {
		this.debug('setCurrentTime', seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.currentTime = seconds;
	};

	setVolume = async (volume: number): Promise<void> => {
		this.debug('setVolume');

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.volume = volume;
	};

	setMuted = async (muted: boolean): Promise<void> => {
		this.debug('setMuted', muted);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.muted = muted;
	};

	getDuration = async (): Promise<number | undefined> => {
		this.debug('getDuration');

		this.assertPlayerAttached();
		if (!this.player) return undefined;

		return this.player.duration;
	};

	getCurrentTime = async (): Promise<number | undefined> => {
		this.debug('getCurrentTime');

		this.assertPlayerAttached();
		if (!this.player) return undefined;

		return this.player.currentTime;
	};
}
