# Nostalgic Diva

React function components for imperatively controlling embedded players (audio, [Niconico](https://www.nicovideo.jp/), [SoundCloud](https://soundcloud.com/) and [YouTube](https://www.youtube.com/)) using refs.

This was originally developed in [VocaDB/vocadb#1101](https://github.com/VocaDB/vocadb/pull/1101) as a part of [VocaDB](https://github.com/VocaDB/vocadb).

## Installation

`yarn add @vocadb/nostalgic-diva` or `npm i @vocadb/nostalgic-diva`

## Usage

See [VocaDB/vocadb#1101](https://github.com/VocaDB/vocadb/pull/1101) for more information.

```tsx
import {
    NostalgicDiva,
    PVPlayerOptions,
    PVService,
} from '@vocadb/nostalgic-diva';
```

```tsx
// Ref
const playerRef = React.useRef<PVPlayer>(undefined!);

// Callbacks
const handleError = React.useCallback(() => {}, []);
const handlePlay = React.useCallback(() => {}, []);
const handlePause = React.useCallback(() => {}, []);
const handleEnded = React.useCallback(() => {}, []);

// Options
const options = React.useMemo(
    () => ({
        onError: handleError,
        onPlay: handlePlay,
        onPause: handlePause,
        onEnded: handleEnded,
    }),
    [handleError, handlePlay, handlePause, handleEnded],
);

const handlePlayerChange = React.useCallback((player?: PVPlayer) => {}, [])

// Audio
<NostalgicDiva
    service={PVService.File}
    playerRef={playerRef}
    options={options}
    onPlayerChange={handlePlayerChange}
/>;

// Niconico
<NostalgicDiva
    service={PVService.Niconico}
    playerRef={playerRef}
    options={options}
    onPlayerChange={handlePlayerChange}
/>;

// SoundCloud
<NostalgicDiva
    service={PVService.SoundCloud}
    playerRef={playerRef}
    options={options}
    onPlayerChange={handlePlayerChange}
/>;

// YouTube
<NostalgicDiva
    service={PVService.YouTube}
    playerRef={playerRef}
    options={options}
    onPlayerChange={handlePlayerChange}
/>;
```

```tsx
const player = playerRef.current;

if (!player) return;

// Load
player.load(pvId);

// Play
player.play();

// Pause
player.pause();

// Mute
player.mute();

// Unmute
player.unmute();
```

## Imperative functions

| Function | Description |
| --- | --- |
| `load(pvId: string): Promise<void>` | Loads the specified video. |
| `play(): void` | Plays the currently loaded video. |
| `pause(): void` | Pauses the currently loaded video. |
| `seekTo(seconds: number): void` | Seeks to a specified time in the video. |
| `setVolume(fraction: number): void` | Sets the volume. Accepts a number between 0 and 1. |
| `mute(): void` | Mutes the player. |
| `unmute(): void` | Unmutes the player. |
| `getCurrentTime(): number | undefined` | Gets the current playback position, in seconds. |

## Events

| Event | Description |
| --- | --- |
| `onError(event: any): void` | Fired when an error occurs in the player. |
| `onPlay(): void` | Fired when the sound begins to play. |
| `onPause(): void` | Fired when the sound pauses. |
| `onEnded(): void` | Fired when the sound finishes. |

## Lifecycle

1. [PVPlayer.attach](https://github.com/ycanardeau/prototypes/blob/36d5fed26bc12ddc537f0a43c02e8eab3995b4d5/prototypes/nostalgic-diva/src/players/PVPlayer.ts#L22)
1. [onPlayerChange](https://github.com/VocaDB/nostalgic-diva/blob/84307a7cc1eb1e72f1bd69eb056efd79ce819d84/src/components/EmbedPV.tsx#L9)
1. [PVPlayer.load](https://github.com/ycanardeau/prototypes/blob/36d5fed26bc12ddc537f0a43c02e8eab3995b4d5/prototypes/nostalgic-diva/src/players/PVPlayer.ts#L24)
1. [PVPlayer.play](https://github.com/ycanardeau/prototypes/blob/36d5fed26bc12ddc537f0a43c02e8eab3995b4d5/prototypes/nostalgic-diva/src/players/PVPlayer.ts#L25)
1. [PVPlayerOptions.onPlay](https://github.com/ycanardeau/prototypes/blob/36d5fed26bc12ddc537f0a43c02e8eab3995b4d5/prototypes/nostalgic-diva/src/players/PVPlayer.ts#L3)
1. [PVPlayer.pause](https://github.com/ycanardeau/prototypes/blob/36d5fed26bc12ddc537f0a43c02e8eab3995b4d5/prototypes/nostalgic-diva/src/players/PVPlayer.ts#L26)
1. [PVPlayerOptions.onPause](https://github.com/ycanardeau/prototypes/blob/36d5fed26bc12ddc537f0a43c02e8eab3995b4d5/prototypes/nostalgic-diva/src/players/PVPlayer.ts#L4)
1. [PVPlayerOptions.onEnded](https://github.com/ycanardeau/prototypes/blob/36d5fed26bc12ddc537f0a43c02e8eab3995b4d5/prototypes/nostalgic-diva/src/players/PVPlayer.ts#L5)
1. [PVPlayer.detach](https://github.com/ycanardeau/prototypes/blob/36d5fed26bc12ddc537f0a43c02e8eab3995b4d5/prototypes/nostalgic-diva/src/players/PVPlayer.ts#L23)

The `attach` function is called when switching from another player (Audio, Niconico, SoundCloud and YouTube), and the `detach` function is called when switching to another player. After the `detach` function is called, you cannot use any imperative functions like `load`, `play`, `pause` and etc.

## References

-   [vocadb/VocaDbWeb/Scripts/ViewModels/PVs/](https://github.com/VocaDB/vocadb/tree/5304e764cf423f07b424e94266e415db40d11f28/VocaDbWeb/Scripts/ViewModels/PVs)
-   [React Player](https://github.com/cookpete/react-player)
-   [ニコニコ動画の HTML5 外部プレイヤーを JavaScript で操作する](https://blog.hayu.io/web/create/nicovideo-embed-player-api/)
-   [Widget API - SoundCloud Developers](https://developers.soundcloud.com/docs/api/html5-widget)
-   [YouTube Player API Reference for iframe Embeds | YouTube IFrame Player API | Google Developers](https://developers.google.com/youtube/iframe_api_reference)
-   [How to support Reusable State in Effects · Discussion #18 · reactwg/react-18](https://github.com/reactwg/react-18/discussions/18)
-   [Synchronizing with Effects](https://beta.reactjs.org/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)
