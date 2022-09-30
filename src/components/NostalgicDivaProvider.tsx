import React from 'react';

import { IPlayerApi } from '../players';

interface NostalgicDivaContextProps extends IPlayerApi {
	playerApiRef: React.MutableRefObject<IPlayerApi | undefined>;
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
	const playerApiRef = React.useRef<IPlayerApi>();

	const loadVideo = React.useCallback(async (id: string) => {
		await playerApiRef.current?.loadVideo(id);
	}, []);

	const play = React.useCallback(async () => {
		await playerApiRef.current?.play();
	}, []);

	const pause = React.useCallback(async () => {
		await playerApiRef.current?.pause();
	}, []);

	const setCurrentTime = React.useCallback(async (seconds: number) => {
		const playerApi = playerApiRef.current;
		if (!playerApi) return;

		await playerApi.setCurrentTime(seconds);
		await playerApi.play();
	}, []);

	const setVolume = React.useCallback(async (volume: number) => {
		await playerApiRef.current?.setVolume(volume);
	}, []);

	const setMuted = React.useCallback(async (muted: boolean) => {
		await playerApiRef.current?.setMuted(muted);
	}, []);

	const getDuration = React.useCallback(async () => {
		return await playerApiRef.current?.getDuration();
	}, []);

	const getCurrentTime = React.useCallback(async () => {
		return await playerApiRef.current?.getCurrentTime();
	}, []);

	const value = React.useMemo(
		(): NostalgicDivaContextProps => ({
			playerApiRef,
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
