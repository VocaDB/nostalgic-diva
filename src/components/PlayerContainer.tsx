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

const usePrevious = <T,>(value: T): T | undefined => {
	const ref = React.useRef<T>();

	React.useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
};

export interface PlayerProps {
	type: PlayerType;
	playerApiRef: React.MutableRefObject<IPlayerApi | undefined> | undefined;
	videoId: string;
	options: PlayerOptions | undefined;
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
		videoId: string,
	) => React.ReactNode;
}

export const PlayerContainer = <
	TElement extends HTMLElement,
	TPlayer extends PlayerApiImpl<TElement>,
>({
	type,
	playerApiRef,
	videoId,
	options,
	loadScript,
	playerApiFactory,
	children,
}: PlayerContainerProps<TElement, TPlayer>): React.ReactElement<
	PlayerContainerProps<TElement, TPlayer>
> => {
	PlayerConsole.debug('PlayerContainer');

	const defaultVideoIdRef = React.useRef(videoId);

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

		playerApi
			.attach(defaultVideoIdRef.current)
			.then(() => setPlayerApi(playerApi));

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

	const previousVideoId = usePrevious(videoId);
	React.useEffect(() => {
		if (previousVideoId === undefined || previousVideoId === videoId)
			return;

		playerApi?.loadVideo(videoId);
	}, [previousVideoId, videoId, playerApi]);

	// Make sure that `videoId` does not change between re-rendering.
	return <>{children(playerElementRef, defaultVideoIdRef.current)}</>;
};
