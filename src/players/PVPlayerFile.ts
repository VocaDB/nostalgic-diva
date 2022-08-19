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
		private readonly options: PVPlayerOptions,
	) {
		this.id = PVPlayerFile.nextId++;

		this.debug(`ctor`);
	}

	attach = async (): Promise<void> => {
		this.debug(`attach`);

		if (this.player) {
			this.debug(`player is already attached`);
			return;
		}

		this.player = this.playerElementRef.current;

		this.debug(`player attached`);
	};

	detach = async (): Promise<void> => {
		this.debug(`detach`);

		this.player = undefined;
	};

	private assertPlayerAttached = (): void => {
		this.assert(!!this.player, `player is not attached`);
	};

	load = async (pvId: string): Promise<void> => {
		this.debug(`load`, pvId);

		this.assert(!!pvId, 'pvId is not defined');
		if (!pvId) return;

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.src = pvId;

		// REVIEW: Do we need to remove event listeners before removing the player element?
		this.player.onplay = (): void => this.options.onPlay?.();
		this.player.onpause = (): void => this.options.onPause?.();
		this.player.onended = (): void => this.options.onEnded?.();
	};

	play = (): void => {
		this.debug(`play`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.play();
	};

	pause = (): void => {
		this.debug(`pause`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.pause();
	};

	seekTo = (seconds: number): void => {
		this.debug(`seekTo`, seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.currentTime = seconds;
	};

	setVolume = (fraction: number): void => {
		this.debug(`setVolume`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.volume = fraction;
	};

	mute = (): void => {
		this.debug(`mute`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.muted = true;
	};

	unmute = (): void => {
		this.debug(`unmute`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.muted = false;
	};
}
