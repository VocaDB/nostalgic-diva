import React from 'react';

import { PVPlayer, PVPlayerOptions } from '../players/PVPlayer';
import { PVPlayerConsole } from '../players/PVPlayerConsole';

export interface EmbedPVPropsBase {
	playerRef?: React.MutableRefObject<PVPlayer | undefined>;
	options?: PVPlayerOptions;
	onPlayerChange?: (player: PVPlayer | undefined) => void;
}

interface EmbedPVProps<TElement extends HTMLElement, TPlayer extends PVPlayer>
	extends EmbedPVPropsBase {
	playerFactory: new (
		playerElementRef: React.MutableRefObject<TElement>,
		options?: PVPlayerOptions,
	) => TPlayer;
	children: (
		playerElementRef: React.MutableRefObject<TElement>,
	) => React.ReactNode;
}

export const EmbedPV = <
	TElement extends HTMLElement,
	TPlayer extends PVPlayer,
>({
	playerRef,
	options,
	onPlayerChange,
	playerFactory,
	children,
}: EmbedPVProps<TElement, TPlayer>): React.ReactElement<
	EmbedPVProps<TElement, TPlayer>
> => {
	PVPlayerConsole.debug('EmbedPV');

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const playerElementRef = React.useRef<TElement>(undefined!);

	const [player, setPlayer] = React.useState<PVPlayer>();

	// Make sure that `options` do not change between re-rendering.
	React.useEffect(() => {
		const player = new playerFactory(playerElementRef, options);

		if (playerRef) playerRef.current = player;

		player.attach().then(() => setPlayer(player));

		return (): void => {
			if (playerRef) {
				PVPlayerConsole.assert(
					player === playerRef.current,
					'player differs',
					player,
					playerRef.current,
				);
			}

			player.detach().then(() => setPlayer(undefined));
		};
	}, [playerRef, options, playerFactory]);

	// Call onPlayerChange in a separate useEffect to prevent the player from being created multiple times.
	React.useEffect(() => {
		onPlayerChange?.(player);
	}, [player, onPlayerChange]);

	return <>{children(playerElementRef)}</>;
};
