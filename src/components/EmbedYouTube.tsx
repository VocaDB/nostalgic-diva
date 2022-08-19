import React from 'react';

import { PVPlayer, PVPlayerOptions } from '../players/PVPlayer';
import { PVPlayerConsole } from '../players/PVPlayerConsole';
import { PVPlayerYouTube } from '../players/PVPlayerYouTube';
import { EmbedPV } from './EmbedPV';

interface EmbedYouTubeProps {
	playerRef?: React.MutableRefObject<PVPlayer | undefined>;
	options: PVPlayerOptions;
}

export const EmbedYouTube = React.memo(
	({ ...props }: EmbedYouTubeProps): React.ReactElement => {
		PVPlayerConsole.debug('EmbedYouTube');

		return (
			<EmbedPV {...props} playerFactory={PVPlayerYouTube}>
				{(playerElementRef): React.ReactElement => (
					<div style={{ width: '100%', height: '100%' }}>
						<div ref={playerElementRef} />
					</div>
				)}
			</EmbedPV>
		);
	},
);
