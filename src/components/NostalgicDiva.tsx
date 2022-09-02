import React from 'react';

import { PlayerType } from '../players/PlayerApi';
import { PlayerConsole } from '../players/PlayerConsole';
import { AudioPlayer } from './AudioPlayer';
import { NiconicoPlayer } from './NiconicoPlayer';
import { PlayerPropsBase } from './Player';
import { SoundCloudPlayer } from './SoundCloudPlayer';
import { YouTubePlayer } from './YouTubePlayer';

const players: Record<PlayerType, React.ElementType<PlayerPropsBase>> = {
	Audio: AudioPlayer,
	Niconico: NiconicoPlayer,
	SoundCloud: SoundCloudPlayer,
	YouTube: YouTubePlayer,
};

interface NostalgicDivaProps extends PlayerPropsBase {
	type: PlayerType;
}

export const NostalgicDiva = React.memo(
	({ type, ...props }: NostalgicDivaProps): React.ReactElement => {
		PlayerConsole.debug('NostalgicDiva');

		const Player = players[type];
		return <Player {...props} />;
	},
);
