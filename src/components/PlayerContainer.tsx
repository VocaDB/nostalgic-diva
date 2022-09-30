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

export interface PlayerProps {
	type: PlayerType;
	playerApiRef: React.MutableRefObject<IPlayerApi | undefined> | undefined;
	options: PlayerOptions | undefined;
	onPlayerApiChange:
		| ((playerApi: IPlayerApi | undefined) => void)
		| undefined;
}

interface PlayerContainerProps<
	TElement extends HTMLElement,
	TPlayer extends PlayerApiImpl<TElement>,
> extends PlayerProps {
	loadScript: (() => Promise<void>) | undefined;
	playerApiFactory: new (
		logger: Logger,
		playerElementRef: React.MutableRefObject<TElement>,
		options: PlayerOptions | undefined,
	) => TPlayer;
	children: (
		playerElementRef: React.MutableRefObject<TElement>,
	) => React.ReactNode;
}

export const PlayerContainer = <
	TElement extends HTMLElement,
	TPlayer extends PlayerApiImpl<TElement>,
>({
	type,
	playerApiRef,
	options,
	onPlayerApiChange,
	loadScript,
	playerApiFactory,
	children,
}: PlayerContainerProps<TElement, TPlayer>): React.ReactElement<
	PlayerContainerProps<TElement, TPlayer>
> => {
	PlayerConsole.debug('PlayerContainer');

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const playerElementRef = React.useRef<TElement>(undefined!);

	const [playerApi, setPlayerApi] = React.useState<IPlayerApi>();

	// Make sure that `options` do not change between re-rendering.
	React.useEffect(() => {
		const playerApi = new PlayerApi(
			type,
			playerElementRef,
			options,
			loadScript,
			playerApiFactory,
		);

		if (playerApiRef) playerApiRef.current = playerApi;

		playerApi.attach().then(() => setPlayerApi(playerApi));

		return (): void => {
			if (playerApiRef) {
				PlayerConsole.assert(
					playerApi === playerApiRef.current,
					'playerApi differs',
					playerApi,
					playerApiRef.current,
				);
			}

			playerApi.detach().then(() => setPlayerApi(undefined));
		};
	}, [type, options, loadScript, playerApiFactory, playerApiRef]);

	// Call onPlayerApiChange in a separate useEffect to prevent the playerApi from being created multiple times.
	React.useEffect(() => {
		onPlayerApiChange?.(playerApi);
	}, [playerApi, onPlayerApiChange]);

	return <>{children(playerElementRef)}</>;
};
