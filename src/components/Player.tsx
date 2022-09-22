import React from 'react';

import { PlayerApi, PlayerOptions } from '../players/PlayerApi';
import { PlayerConsole } from '../players/PlayerConsole';

export interface PlayerPropsBase {
	playerRef: React.MutableRefObject<PlayerApi | undefined> | undefined;
	options: PlayerOptions | undefined;
	onPlayerChange: ((player: PlayerApi | undefined) => void) | undefined;
}

interface PlayerProps<TElement extends HTMLElement, TPlayer extends PlayerApi>
	extends PlayerPropsBase {
	playerApi: new (
		playerElementRef: React.MutableRefObject<TElement>,
		options?: PlayerOptions,
	) => TPlayer;
	children: (
		playerElementRef: React.MutableRefObject<TElement>,
	) => React.ReactNode;
}

export const Player = <
	TElement extends HTMLElement,
	TPlayer extends PlayerApi,
>({
	playerRef,
	options,
	onPlayerChange,
	playerApi,
	children,
}: PlayerProps<TElement, TPlayer>): React.ReactElement<
	PlayerProps<TElement, TPlayer>
> => {
	PlayerConsole.debug('Player');

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const playerElementRef = React.useRef<TElement>(undefined!);

	const [player, setPlayer] = React.useState<PlayerApi>();

	// Make sure that `options` do not change between re-rendering.
	React.useEffect(() => {
		const player = new playerApi(playerElementRef, options);

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
	}, [playerRef, options, playerApi]);

	// Call onPlayerChange in a separate useEffect to prevent the player from being created multiple times.
	React.useEffect(() => {
		onPlayerChange?.(player);
	}, [player, onPlayerChange]);

	return <>{children(playerElementRef)}</>;
};
