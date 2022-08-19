import React from 'react';

import { PVPlayer, PVPlayerOptions } from '../players/PVPlayer';
import { PVPlayerConsole } from '../players/PVPlayerConsole';

interface EmbedPVProps<TElement extends HTMLElement, TPlayer extends PVPlayer> {
	playerRef?: React.MutableRefObject<PVPlayer | undefined>;
	options: PVPlayerOptions;
	playerFactory: new (
		playerElementRef: React.MutableRefObject<TElement>,
		options: PVPlayerOptions,
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
	playerFactory,
	children,
}: EmbedPVProps<TElement, TPlayer>): React.ReactElement<
	EmbedPVProps<TElement, TPlayer>
> => {
	PVPlayerConsole.debug('EmbedPV');

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const playerElementRef = React.useRef<TElement>(undefined!);

	React.useEffect(() => {
		const player = new playerFactory(playerElementRef, options);

		if (playerRef) playerRef.current = player;

		player.attach();

		return (): void => {
			if (playerRef) {
				PVPlayerConsole.assert(
					player === playerRef.current,
					'player differs',
					player,
					playerRef.current,
				);
			}

			player.detach();
		};
	}, [playerRef, options, playerFactory]);

	return <>{children(playerElementRef)}</>;
};
