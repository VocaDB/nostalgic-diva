import React from 'react';

import { NiconicoPlayerApiImpl } from '../players/NiconicoPlayerApi';
import { PlayerConsole } from '../players/PlayerConsole';
import { Player, PlayerPropsBase } from './Player';

export const NiconicoPlayer = React.memo(
	({ ...props }: PlayerPropsBase): React.ReactElement => {
		PlayerConsole.debug('NiconicoPlayer');

		return (
			<Player {...props} playerApi={NiconicoPlayerApiImpl}>
				{(playerElementRef): React.ReactElement => (
					<div style={{ width: '100%', height: '100%' }}>
						{/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
						<iframe
							ref={playerElementRef}
							width="100%"
							height="100%"
							allowFullScreen
							style={{ border: 'none' }}
							// The player has to have the allow="autoplay" attribute.
							// Otherwise it throws a NotAllowedError: "play() failed because the user didn't interact with the document first".
							// See also: https://github.com/vimeo/player.js/issues/389.
							// NOTE: An iframe element created by `PVPlayerNiconico.playerFactory.create` doesn't have the allow="autoplay" attribute,
							// which causes the above issue when trying to autoplay a video.
							allow="autoplay; fullscreen"
						/>
					</div>
				)}
			</Player>
		);
	},
);
