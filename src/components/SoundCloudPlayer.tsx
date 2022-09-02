import React from 'react';

import { PlayerConsole } from '../players/PlayerConsole';
import { SoundCloudPlayerApi } from '../players/SoundCloudPlayerApi';
import { Player, PlayerPropsBase } from './Player';

export const SoundCloudPlayer = React.memo(
	({ ...props }: PlayerPropsBase): React.ReactElement => {
		PlayerConsole.debug('SoundCloudPlayer');

		return (
			<Player {...props} playerApi={SoundCloudPlayerApi}>
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
			</Player>
		);
	},
);
