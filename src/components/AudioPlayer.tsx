import React from 'react';

import { AudioPlayerApi } from '../players/AudioPlayerApi';
import { PlayerConsole } from '../players/PlayerConsole';
import { Player, PlayerPropsBase } from './Player';

export const AudioPlayer = React.memo(
	({ ...props }: PlayerPropsBase): React.ReactElement => {
		PlayerConsole.debug('AudioPlayer');

		return (
			<Player
				{...props}
				loadScript={undefined}
				playerApi={AudioPlayerApi}
			>
				{(playerElementRef): React.ReactElement => (
					<audio
						ref={playerElementRef}
						style={{ width: '100%', height: '100%' }}
						preload="auto"
						autoPlay
						controls
					/>
				)}
			</Player>
		);
	},
);
