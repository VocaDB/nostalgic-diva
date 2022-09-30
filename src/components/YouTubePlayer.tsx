import React from 'react';

import { PlayerConsole } from '../players/PlayerConsole';
import { YouTubePlayerApi } from '../players/YouTubePlayerApi';
import { ensureScriptLoaded } from '../players/ensureScriptLoaded';
import { PlayerContainer, PlayerProps } from './PlayerContainer';

export const YouTubePlayer = React.memo(
	({ ...props }: PlayerProps): React.ReactElement => {
		PlayerConsole.debug('YouTubePlayer');

		const loadScript = React.useCallback((): Promise<void> => {
			return new Promise(async (resolve, reject) => {
				const first = await ensureScriptLoaded(
					'https://www.youtube.com/iframe_api',
				);

				if (first) {
					// Code from: https://stackoverflow.com/a/18154942.
					window.onYouTubeIframeAPIReady = (): void => {
						PlayerConsole.debug('YouTube iframe API ready');
						resolve();
					};
				} else {
					resolve();
				}
			});
		}, []);

		return (
			<PlayerContainer
				{...props}
				loadScript={loadScript}
				playerApiFactory={YouTubePlayerApi}
			>
				{(playerElementRef): React.ReactElement => (
					<div style={{ width: '100%', height: '100%' }}>
						<div ref={playerElementRef} />
					</div>
				)}
			</PlayerContainer>
		);
	},
);
