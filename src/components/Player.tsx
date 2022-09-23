import React from 'react';

import {
	IPlayerApi,
	Logger,
	PlayerApi,
	PlayerOptions,
	PlayerType,
} from '../players/PlayerApi';
import { PlayerApiImpl } from '../players/PlayerApiImpl';
import { PlayerConsole } from '../players/PlayerConsole';

export interface PlayerPropsBase {
	playerType: PlayerType;
	playerRef: React.MutableRefObject<IPlayerApi | undefined> | undefined;
	options: PlayerOptions | undefined;
	onPlayerChange: ((player: IPlayerApi | undefined) => void) | undefined;
}

interface PlayerProps<
	TElement extends HTMLElement,
	TPlayer extends PlayerApiImpl<TElement>,
> extends PlayerPropsBase {
	loadScript: (() => Promise<void>) | undefined;
	playerApi: new (
		logger: Logger,
		playerElementRef: React.MutableRefObject<TElement>,
		options: PlayerOptions | undefined,
	) => TPlayer;
	children: (
		playerElementRef: React.MutableRefObject<TElement>,
	) => React.ReactNode;
}

export const Player = <
	TElement extends HTMLElement,
	TPlayer extends PlayerApiImpl<TElement>,
>({
	playerType,
	playerRef,
	options,
	onPlayerChange,
	loadScript,
	playerApi,
	children,
}: PlayerProps<TElement, TPlayer>): React.ReactElement<
	PlayerProps<TElement, TPlayer>
> => {
	PlayerConsole.debug('Player');

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const playerElementRef = React.useRef<TElement>(undefined!);

	const [player, setPlayer] = React.useState<IPlayerApi>();

	// Make sure that `options` do not change between re-rendering.
	React.useEffect(() => {
		const player = new PlayerApi(
			playerType,
			playerElementRef,
			options,
			loadScript,
			playerApi,
		);

		if (playerRef) playerRef.current = player;

		player.attach().then(() => setPlayer(player));

		return (): void => {
			if (playerRef) {
				PlayerConsole.assert(
					player === playerRef.current,
					'player differs',
					player,
					playerRef.current,
				);
			}

			player.detach().then(() => setPlayer(undefined));
		};
	}, [playerType, options, loadScript, playerApi, playerRef]);

	// Call onPlayerChange in a separate useEffect to prevent the player from being created multiple times.
	React.useEffect(() => {
		onPlayerChange?.(player);
	}, [player, onPlayerChange]);

	return <>{children(playerElementRef)}</>;
};
