import React from 'react';

import { IPlayerApi, PlayerOptions, PlayerType } from '../players/PlayerApi';
import { PlayerConsole } from '../players/PlayerConsole';
import { AudioPlayer } from './AudioPlayer';
import { NiconicoPlayer } from './NiconicoPlayer';
import { useNostalgicDiva } from './NostalgicDivaProvider';
import { PlayerProps } from './Player';
import { SoundCloudPlayer } from './SoundCloudPlayer';
import { VimeoPlayer } from './VimeoPlayer';
import { YouTubePlayer } from './YouTubePlayer';

const players: Record<PlayerType, React.ElementType<PlayerProps>> = {
	Audio: AudioPlayer,
	Niconico: NiconicoPlayer,
	SoundCloud: SoundCloudPlayer,
	Vimeo: VimeoPlayer,
	YouTube: YouTubePlayer,
};

interface NostalgicDivaProps {
	type: PlayerType;
	options?: PlayerOptions;
	onPlayerApiChange?: (playerApi: IPlayerApi | undefined) => void;
}

export const NostalgicDiva = React.memo(
	({
		type,
		options,
		onPlayerApiChange,
	}: NostalgicDivaProps): React.ReactElement => {
		PlayerConsole.debug('NostalgicDiva');

		const diva = useNostalgicDiva();

		const Player = players[type];
		return (
			<Player
				type={type}
				playerApiRef={diva.playerApiRef}
				options={options}
				onPlayerApiChange={onPlayerApiChange}
			/>
		);
	},
);
