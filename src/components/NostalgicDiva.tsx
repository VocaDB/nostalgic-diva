import React from 'react';

import { PVService } from '../players/PVPlayer';
import { PVPlayerConsole } from '../players/PVPlayerConsole';
import { EmbedFile } from './EmbedFile';
import { EmbedNiconico } from './EmbedNiconico';
import { EmbedPVPropsBase } from './EmbedPV';
import { EmbedSoundCloud } from './EmbedSoundCloud';
import { EmbedYouTube } from './EmbedYouTube';

const players: Record<PVService, React.ElementType<EmbedPVPropsBase>> = {
	[PVService.File]: EmbedFile,
	[PVService.LocalFile]: EmbedFile,
	[PVService.Niconico]: EmbedNiconico,
	[PVService.SoundCloud]: EmbedSoundCloud,
	[PVService.YouTube]: EmbedYouTube,
};

interface NostalgicDivaProps extends EmbedPVPropsBase {
	service: PVService;
}

export const NostalgicDiva = React.memo(
	({ service, ...props }: NostalgicDivaProps): React.ReactElement => {
		PVPlayerConsole.debug('EmbedPV');

		const Player = players[service];
		return <Player {...props} />;
	},
);
