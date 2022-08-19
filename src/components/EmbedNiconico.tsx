import React from 'react';

import { PVPlayer, PVPlayerOptions } from '../players/PVPlayer';
import { PVPlayerConsole } from '../players/PVPlayerConsole';
import { PVPlayerNiconico } from '../players/PVPlayerNiconico';
import { EmbedPV } from './EmbedPV';

interface EmbedNiconicoProps {
	playerRef?: React.MutableRefObject<PVPlayer | undefined>;
	options: PVPlayerOptions;
}

export const EmbedNiconico = React.memo(
	({ ...props }: EmbedNiconicoProps): React.ReactElement => {
		PVPlayerConsole.debug('EmbedNiconico');

		return (
			<EmbedPV {...props} playerFactory={PVPlayerNiconico}>
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
			</EmbedPV>
		);
	},
);
