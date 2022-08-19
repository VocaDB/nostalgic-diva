import { PVPlayer, PVPlayerOptions } from './PVPlayer';
import { PVPlayerConsole } from './PVPlayerConsole';

// Code from: https://github.com/VocaDB/vocadb/blob/61b8c54f3eca906a477101dab4fdd9b154be310e/VocaDbWeb/Scripts/ViewModels/PVs/PVPlayerFile.ts.
export class PVPlayerFile implements PVPlayer {
	private static nextId = 1;

	private readonly id: number;
	private player?: HTMLAudioElement;

	constructor(
		private readonly playerElementRef: React.MutableRefObject<HTMLAudioElement>,
		private readonly options: PVPlayerOptions,
	) {
		this.id = PVPlayerFile.nextId++;

		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.ctor`);
	}

	attach = async (): Promise<void> => {
		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.attach`);

		if (this.player) {
			PVPlayerConsole.debug('File player is already attached');
			return;
		}

		this.player = this.playerElementRef.current;

		PVPlayerConsole.debug('File player attached');
	};

	detach = async (): Promise<void> => {
		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.detach`);

		this.player = undefined;
	};

	private assertPlayerAttached = (): void => {
		PVPlayerConsole.assert(!!this.player, 'File player is not attached');
	};

	load = async (pvId: string): Promise<void> => {
		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.load`, pvId);

		PVPlayerConsole.assert(!!pvId, 'pvId is not defined');
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
		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.play`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.play();
	};

	pause = (): void => {
		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.pause`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.pause();
	};

	seekTo = (seconds: number): void => {
		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.seekTo`, seconds);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.currentTime = seconds;
	};

	setVolume = (fraction: number): void => {
		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.setVolume`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.volume = fraction;
	};

	mute = (): void => {
		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.mute`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.muted = true;
	};

	unmute = (): void => {
		PVPlayerConsole.debug(`PVPlayerFile#${this.id}.unmute`);

		this.assertPlayerAttached();
		if (!this.player) return;

		this.player.muted = false;
	};
}
