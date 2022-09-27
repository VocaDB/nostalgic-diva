import React from 'react';

import { IPlayerApi } from '../players';

interface NostalgicDivaContextProps extends IPlayerApi {
	playerRef: React.MutableRefObject<IPlayerApi | undefined>;
}

const NostalgicDivaContext = React.createContext<NostalgicDivaContextProps>(
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	undefined!,
);

interface NostalgicDivaProviderProps {
	children?: React.ReactNode;
}

export const NostalgicDivaProvider = ({
	children,
}: NostalgicDivaProviderProps): React.ReactElement => {
	const playerRef = React.useRef<IPlayerApi>();

	const loadVideo = React.useCallback(async (id: string) => {
		await playerRef.current?.loadVideo(id);
	}, []);

	const play = React.useCallback(async () => {
		await playerRef.current?.play();
	}, []);

	const pause = React.useCallback(async () => {
		await playerRef.current?.pause();
	}, []);

	const setCurrentTime = React.useCallback(async (seconds: number) => {
		const player = playerRef.current;
		if (!player) return;

		await player.setCurrentTime(seconds);
		await player.play();
	}, []);

	const setVolume = React.useCallback(async (volume: number) => {
		await playerRef.current?.setVolume(volume);
	}, []);

	const setMuted = React.useCallback(async (muted: boolean) => {
		await playerRef.current?.setMuted(muted);
	}, []);

	const getDuration = React.useCallback(async () => {
		return await playerRef.current?.getDuration();
	}, []);

	const getCurrentTime = React.useCallback(async () => {
		return await playerRef.current?.getCurrentTime();
	}, []);

	const value = React.useMemo(
		(): NostalgicDivaContextProps => ({
			playerRef,
			loadVideo,
			play,
			pause,
			setCurrentTime,
			setVolume,
			setMuted,
			getDuration,
			getCurrentTime,
		}),
		[
			loadVideo,
			play,
			pause,
			setCurrentTime,
			setVolume,
			setMuted,
			getDuration,
			getCurrentTime,
		],
	);

	return (
		<NostalgicDivaContext.Provider value={value}>
			{children}
		</NostalgicDivaContext.Provider>
	);
};

export const useNostalgicDiva = (): NostalgicDivaContextProps => {
	return React.useContext(NostalgicDivaContext);
};
