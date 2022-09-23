import React from 'react';

import { PlayerConsole } from '../players/PlayerConsole';
import { VimeoPlayerApi } from '../players/VimeoPlayerApi';
import { Player, PlayerPropsBase } from './Player';

export const VimeoPlayer = React.memo(
	({ ...props }: PlayerPropsBase): React.ReactElement => {
		PlayerConsole.debug('VimeoPlayer');

		return (
			<Player {...props} playerApi={VimeoPlayerApi}>
				{(playerElementRef): React.ReactElement => (
					// eslint-disable-next-line jsx-a11y/iframe-has-title
					<iframe
						ref={playerElementRef}
						// HACK: Load a placeholder video.
						src="https://player.vimeo.com/video/76979871"
						frameBorder={0}
						allow="autoplay"
						style={{ width: '100%', height: '100%' }}
					/>
				)}
			</Player>
		);
	},
);
