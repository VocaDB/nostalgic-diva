import React from 'react';

import { IPlayerApi, PlayerApi, PlayerOptions } from '../players/PlayerApi';
import { PlayerApiImpl } from '../players/PlayerApiImpl';
import { PlayerConsole } from '../players/PlayerConsole';

export interface PlayerPropsBase {
	playerRef: React.MutableRefObject<IPlayerApi | undefined> | undefined;
	options: PlayerOptions | undefined;
	onPlayerChange: ((player: IPlayerApi | undefined) => void) | undefined;
}

interface PlayerProps<
	TElement extends HTMLElement,
	TPlayer extends PlayerApiImpl<TElement>,
> extends PlayerPropsBase {
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
	TPlayer extends PlayerApiImpl<TElement>,
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

	const [player, setPlayer] = React.useState<IPlayerApi>();

	// Make sure that `options` do not change between re-rendering.
	React.useEffect(() => {
		const player = new PlayerApi(playerElementRef, options, playerApi);

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
	}, [options, playerApi, playerRef]);

	// Call onPlayerChange in a separate useEffect to prevent the player from being created multiple times.
	React.useEffect(() => {
		onPlayerChange?.(player);
	}, [player, onPlayerChange]);

	return <>{children(playerElementRef)}</>;
};
