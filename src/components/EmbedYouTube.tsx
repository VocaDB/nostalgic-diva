import React from 'react';

import { PVPlayerConsole } from '../players/PVPlayerConsole';
import { PVPlayerYouTube } from '../players/PVPlayerYouTube';
import { EmbedPV, EmbedPVPropsBase } from './EmbedPV';

export const EmbedYouTube = React.memo(
	({ ...props }: EmbedPVPropsBase): React.ReactElement => {
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
