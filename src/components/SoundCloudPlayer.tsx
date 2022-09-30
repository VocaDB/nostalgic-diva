import React from 'react';

import { PlayerConsole } from '../players/PlayerConsole';
import { SoundCloudPlayerApi } from '../players/SoundCloudPlayerApi';
import { ensureScriptLoaded } from '../players/ensureScriptLoaded';
import { PlayerContainer, PlayerProps } from './PlayerContainer';

export const SoundCloudPlayer = React.memo(
	({ ...props }: PlayerProps): React.ReactElement => {
		PlayerConsole.debug('SoundCloudPlayer');

		const loadScript = React.useCallback(async () => {
			await ensureScriptLoaded('https://w.soundcloud.com/player/api.js');
		}, []);

		return (
			<PlayerContainer
				{...props}
				loadScript={loadScript}
				playerApiFactory={SoundCloudPlayerApi}
			>
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
			</PlayerContainer>
		);
	},
);
