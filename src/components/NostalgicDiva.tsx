import React from 'react';

import { IPlayerApi, PlayerOptions, PlayerType } from '../players/PlayerApi';
import { PlayerConsole } from '../players/PlayerConsole';
import { AudioPlayer } from './AudioPlayer';
import { NiconicoPlayer } from './NiconicoPlayer';
import { useNostalgicDiva } from './NostalgicDivaProvider';
import { PlayerProps } from './PlayerContainer';
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
	videoId: string;
	options?: PlayerOptions;
	onPlayerApiChange?: (playerApi: IPlayerApi | undefined) => void;
}

export const NostalgicDiva = React.memo(
	({
		type,
		videoId,
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
				videoId={videoId}
				options={options}
				onPlayerApiChange={onPlayerApiChange}
			/>
		);
	},
);
