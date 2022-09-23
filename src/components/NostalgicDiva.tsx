import React from 'react';

import { IPlayerApi, PlayerOptions, PlayerType } from '../players/PlayerApi';
import { PlayerConsole } from '../players/PlayerConsole';
import { AudioPlayer } from './AudioPlayer';
import { NiconicoPlayer } from './NiconicoPlayer';
import { useNostalgicDiva } from './NostalgicDivaProvider';
import { PlayerPropsBase } from './Player';
import { SoundCloudPlayer } from './SoundCloudPlayer';
import { VimeoPlayer } from './VimeoPlayer';
import { YouTubePlayer } from './YouTubePlayer';

const players: Record<PlayerType, React.ElementType<PlayerPropsBase>> = {
	Audio: AudioPlayer,
	Niconico: NiconicoPlayer,
	SoundCloud: SoundCloudPlayer,
	Vimeo: VimeoPlayer,
	YouTube: YouTubePlayer,
};

interface NostalgicDivaProps {
	type: PlayerType;
	options?: PlayerOptions;
	onPlayerChange?: (player: IPlayerApi | undefined) => void;
}

export const NostalgicDiva = React.memo(
	({
		type,
		options,
		onPlayerChange,
	}: NostalgicDivaProps): React.ReactElement => {
		PlayerConsole.debug('NostalgicDiva');

		const diva = useNostalgicDiva();

		const Player = players[type];
		return (
			<Player
				playerType={type}
				playerRef={diva.playerRef}
				options={options}
				onPlayerChange={onPlayerChange}
			/>
		);
	},
);
