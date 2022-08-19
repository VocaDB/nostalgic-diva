import React from 'react';

import { PVPlayer, PVPlayerOptions } from '../players/PVPlayer';
import { PVPlayerConsole } from '../players/PVPlayerConsole';
import { PVPlayerFile } from '../players/PVPlayerFile';
import { EmbedPV } from './EmbedPV';

interface EmbedFileProps {
	playerRef?: React.MutableRefObject<PVPlayer | undefined>;
	options: PVPlayerOptions;
}

export const EmbedFile = React.memo(
	({ ...props }: EmbedFileProps): React.ReactElement => {
		PVPlayerConsole.debug('EmbedFile');

		return (
			<EmbedPV {...props} playerFactory={PVPlayerFile}>
				{(playerElementRef): React.ReactElement => (
					<audio
						ref={playerElementRef}
						style={{ width: '100%', height: '100%' }}
						preload="auto"
						autoPlay
						controls
					/>
				)}
			</EmbedPV>
		);
	},
);
