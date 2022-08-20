import React from 'react';

import { PVPlayerConsole } from '../players/PVPlayerConsole';
import { PVPlayerSoundCloud } from '../players/PVPlayerSoundCloud';
import { EmbedPV, EmbedPVPropsBase } from './EmbedPV';

export const EmbedSoundCloud = React.memo(
	({ ...props }: EmbedPVPropsBase): React.ReactElement => {
		PVPlayerConsole.debug('EmbedSoundCloud');

		return (
			<EmbedPV {...props} playerFactory={PVPlayerSoundCloud}>
				{(playerElementRef): React.ReactElement => (
					// eslint-disable-next-line jsx-a11y/iframe-has-title
					<iframe
						ref={playerElementRef}
						src="https://w.soundcloud.com/player/?url="
						frameBorder={0}
						allow="autoplay"
						style={{ width: '100%', height: '100%' }}
					/>
				)}
			</EmbedPV>
		);
	},
);
