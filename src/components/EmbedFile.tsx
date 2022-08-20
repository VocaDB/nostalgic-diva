import React from 'react';

import { PVPlayerConsole } from '../players/PVPlayerConsole';
import { PVPlayerFile } from '../players/PVPlayerFile';
import { EmbedPV, EmbedPVPropsBase } from './EmbedPV';

export const EmbedFile = React.memo(
	({ ...props }: EmbedPVPropsBase): React.ReactElement => {
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
