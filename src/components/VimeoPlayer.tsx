import React from 'react';

import { PlayerConsole } from '../players/PlayerConsole';
import { VimeoPlayerApi } from '../players/VimeoPlayerApi';
import { ensureScriptLoaded } from '../players/ensureScriptLoaded';
import { Player, PlayerProps } from './Player';

export const VimeoPlayer = React.memo(
	({ ...props }: PlayerProps): React.ReactElement => {
		PlayerConsole.debug('VimeoPlayer');

		const loadScript = React.useCallback(async () => {
			await ensureScriptLoaded('https://player.vimeo.com/api/player.js');
		}, []);

		return (
			<Player
				{...props}
				loadScript={loadScript}
				playerApiFactory={VimeoPlayerApi}
			>
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
