import React from 'react';

import { PlayerConsole } from '../players/PlayerConsole';
import { YouTubePlayerApiImpl } from '../players/YouTubePlayerApi';
import { Player, PlayerPropsBase } from './Player';

export const YouTubePlayer = React.memo(
	({ ...props }: PlayerPropsBase): React.ReactElement => {
		PlayerConsole.debug('YouTubePlayer');

		return (
			<Player {...props} playerApi={YouTubePlayerApiImpl}>
				{(playerElementRef): React.ReactElement => (
					<div style={{ width: '100%', height: '100%' }}>
						<div ref={playerElementRef} />
					</div>
				)}
			</Player>
		);
	},
);
