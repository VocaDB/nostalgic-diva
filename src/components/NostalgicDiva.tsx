import React from 'react';

import { PVPlayer, PVPlayerOptions, PVService } from '../players/PVPlayer';
import { PVPlayerConsole } from '../players/PVPlayerConsole';
import { EmbedFile } from './EmbedFile';
import { EmbedNiconico } from './EmbedNiconico';
import { EmbedSoundCloud } from './EmbedSoundCloud';
import { EmbedYouTube } from './EmbedYouTube';

const players: Record<PVService, React.ElementType> = {
	[PVService.File]: EmbedFile,
	[PVService.LocalFile]: EmbedFile,
	[PVService.Niconico]: EmbedNiconico,
	[PVService.SoundCloud]: EmbedSoundCloud,
	[PVService.YouTube]: EmbedYouTube,
};

interface NostalgicDivaProps {
	service: PVService;
	playerRef: React.MutableRefObject<PVPlayer | undefined>;
	options: PVPlayerOptions;
}

export const NostalgicDiva = React.memo(
	({
		service,
		playerRef,
		options,
	}: NostalgicDivaProps): React.ReactElement => {
		PVPlayerConsole.debug('EmbedPV');

		const Player = players[service];
		return <Player playerRef={playerRef} options={options} />;
	},
);
