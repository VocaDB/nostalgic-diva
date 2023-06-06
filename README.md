# Nostalgic Diva

React function components for imperatively controlling embedded players (audio, [Niconico](https://www.nicovideo.jp/), [SoundCloud](https://soundcloud.com/), [Vimeo](https://vimeo.com/) and [YouTube](https://www.youtube.com/)) using refs.

This was originally developed in [VocaDB/vocadb#1101](https://github.com/VocaDB/vocadb/pull/1101) as a part of VocaDB.

See [VocaDB](https://vocadb.net/) and [its playlist page](https://vocadb.net/playlist).

## Installation

`yarn add @vocadb/nostalgic-diva` or `npm i @vocadb/nostalgic-diva`

## Usage

For more information, see [VdbPlayer.tsx](https://github.com/VocaDB/vocadb/blob/dfcb56868a529ea2af508a75a837589caa7cb87f/VocaDbWeb/Scripts/Components/VdbPlayer/VdbPlayer.tsx) and [PlaylistIndex.tsx](https://github.com/VocaDB/vocadb/blob/f84859d9e558341de3b16677adf1699d757fc9a0/VocaDbWeb/Scripts/Pages/Playlist/PlaylistIndex.tsx).

```tsx
import {
	NostalgicDiva,
	NostalgicDivaProvider,
	PlayerOptions,
} from '@aigamo/nostalgic-diva';

// Callbacks
const handleError = React.useCallback(() => {}, []);
const handlePlay = React.useCallback(() => {}, []);
const handlePause = React.useCallback(() => {}, []);
const handleEnded = React.useCallback(() => {}, []);
const handleTimeUpdate = React.useCallback(() => {}, []);

// Options
const options = React.useMemo(
	(): PlayerOptions => ({
		onError: handleError,
		onPlay: handlePlay,
		onPause: handlePause,
		onEnded: handleEnded,
		onTimeUpdate: handleTimeUpdate,
	}),
	[handleError, handlePlay, handlePause, handleEnded, handleTimeUpdate],
);

<NostalgicDivaProvider>
	<NostalgicDiva
		// Supported media types:
		// - "Audio"
		// - "Niconico"
		// - "SoundCloud"
		// - "Vimeo"
		// - "YouTube"
		type="Audio"
		videoId={videoId}
		options={options}
	/>
	;
</NostalgicDivaProvider>;
```

```tsx
import { useNostalgicDiva } from '@aigamo/nostalgic-diva';

const diva = useNostalgicDiva();

// Play
await diva.play();

// Pause
await diva.pause();

// Mute
await diva.setMuted(true);

// Unmute
await diva.setMuted(false);

// Seek
await diva.setCurrentTime(seconds);
```

## Imperative functions

| Function                                         | Description                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| `loadVideo(id: string): Promise<void>`           | Loads a new video into an existing player.                          |
| `play(): Promise<void>`                          | Plays a video.                                                      |
| `pause(): Promise<void>`                         | Pauses the playback of a video.                                     |
| `setCurrentTime(seconds: number): Promise<void>` | Sets the current playback position in seconds.                      |
| `setVolume(volume: number): Promise<void>`       | Sets the volume level of the player on a scale from 0 to 1.         |
| `setMuted(muted: boolean): Promise<void>`        | Sets the muted state of the player.                                 |
| `getDuration(): Promise<number \| undefined>`    | Gets the duration of the video in seconds.                          |
| `getCurrentTime(): Promise<number \| undefined>` | Gets the current playback position of a video, measured in seconds. |

## Events

| Event                                  | Description                                            |
| -------------------------------------- | ------------------------------------------------------ |
| `onError(event: any): void`            | Fired when the player experiences some sort of error.  |
| `onPlay(): void`                       | Fired when the video plays.                            |
| `onPause(): void`                      | Fired when the video is paused.                        |
| `onEnded(): void`                      | Fired when playback reaches the end of a video.        |
| `onTimeUpdate(event: TimeEvent): void` | Fired when the playback position of the video changes. |

## Lifecycle

1. [PlayerApi.attach](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L84)
1. [IPlayerApi.loadVideo](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L33)
1. [PlayerOptions.onLoaded](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L25)
1. [IPlayerApi.play](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L34)
1. [PlayerOptions.onPlay](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L26)
1. [PlayerOptions.onTimeUpdate](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L29)
1. [IPlayerApi.pause](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L35)
1. [PlayerOptions.onPause](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L27)
1. [PlayerOptions.onEnded](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L28)
1. [PlayerApi.detach](https://github.com/VocaDB/nostalgic-diva/blob/5cc35c68cf71230f9459804a9dd9e9265cfa2297/src/players/PlayerApi.ts#L111)

The `attach` function is called when switching from another player (Audio, Niconico, SoundCloud and YouTube), and the `detach` function is called when switching to another player. After the `detach` function is called, you cannot use any imperative functions like `loadVideo`, `play`, `pause` and etc.

## References

-   [vocadb/VocaDbWeb/Scripts/ViewModels/PVs/](https://github.com/VocaDB/vocadb/tree/5304e764cf423f07b424e94266e415db40d11f28/VocaDbWeb/Scripts/ViewModels/PVs)
-   [React Player](https://github.com/cookpete/react-player)
-   [ニコニコ動画の HTML5 外部プレイヤーを JavaScript で操作する](https://blog.hayu.io/web/create/nicovideo-embed-player-api/)
-   [Widget API - SoundCloud Developers](https://developers.soundcloud.com/docs/api/html5-widget)
-   [Player SDK: Reference - Vimeo Developer](https://developer.vimeo.com/player/sdk/reference)
-   [YouTube Player API Reference for iframe Embeds | YouTube IFrame Player API | Google Developers](https://developers.google.com/youtube/iframe_api_reference)
-   [How to support Reusable State in Effects · Discussion #18 · reactwg/react-18](https://github.com/reactwg/react-18/discussions/18)
-   [Synchronizing with Effects](https://beta.reactjs.org/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)
