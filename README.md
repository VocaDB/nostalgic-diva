# Nostalgic Diva

React function components for imperatively controlling embedded players (audio, [Niconico](https://www.nicovideo.jp/), [SoundCloud](https://soundcloud.com/), [Vimeo](https://vimeo.com/) and [YouTube](https://www.youtube.com/)) using refs.

This was originally developed in [VocaDB/vocadb#1101](https://github.com/VocaDB/vocadb/pull/1101) as a part of [VocaDB](https://github.com/VocaDB/vocadb).

## Live demo

See [VocaDB](https://vocadb.net/) and [its playlist page](https://vocadb.net/playlist).

## Installation

`yarn add @vocadb/nostalgic-diva` or `npm i @vocadb/nostalgic-diva`

## Usage

For more information, see [VdbPlayer.tsx](https://github.com/VocaDB/vocadb/blob/97f689d95c98fe73a7ba01ffd141b1ee840b4d17/VocaDbWeb/Scripts/Components/VdbPlayer/VdbPlayer.tsx) and [PlaylistIndex.tsx](https://github.com/VocaDB/vocadb/blob/97f689d95c98fe73a7ba01ffd141b1ee840b4d17/VocaDbWeb/Scripts/Pages/Playlist/PlaylistIndex.tsx).

```tsx
import {
    IPlayerApi,
    NostalgicDiva,
    NostalgicDivaProvider,
    PlayerOptions,
} from '@vocadb/nostalgic-diva';

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
    [
        handleError,
        handlePlay,
        handlePause,
        handleEnded,
        handleTimeUpdate,
    ],
);

const handlePlayerApiChange = React.useCallback((playerApi?: IPlayerApi) => {
    // ...
}, [])

<NostalgicDivaProvider>
    <NostalgicDiva
        // Supported media types:
        // - "Audio"
        // - "Niconico"
        // - "SoundCloud"
        // - "Vimeo"
        // - "YouTube"
        type="Audio"
        options={options}
        onPlayerApiChange={handlePlayerApiChange}
    />;
</NostalgicDivaProvider>
```

```tsx
import {
    useNostalgicDiva,
} from '@vocadb/nostalgic-diva';

const diva = useNostalgicDiva();

// Load
await diva.loadVideo(id);

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

| Function | Description |
| --- | --- |
| `loadVideo(id: string): Promise<void>` | Loads a new video into an existing player. |
| `play(): Promise<void>` | Plays a video. |
| `pause(): Promise<void>` | Pauses the playback of a video. |
| `setCurrentTime(seconds: number): Promise<void>` | Sets the current playback position in seconds. |
| `setVolume(volume: number): Promise<void>` | Sets the volume level of the player on a scale from 0 to 1. |
| `setMuted(muted: boolean): Promise<void>` | Sets the muted state of the player. |
| `getDuration(): Promise<number \| undefined>` | Gets the duration of the video in seconds. |
| `getCurrentTime(): Promise<number \| undefined>` | Gets the current playback position of a video, measured in seconds. |

## Events

| Event | Description |
| --- | --- |
| `onError(event: any): void` | Fired when the player experiences some sort of error. |
| `onPlay(): void` | Fired when the video plays. |
| `onPause(): void` | Fired when the video is paused. |
| `onEnded(): void` | Fired when playback reaches the end of a video. |
| `onTimeUpdate(event: TimeEvent): void` | Fired when the playback position of the video changes. |

## Lifecycle

1. [PlayerApi.attach](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/players/PlayerApi.ts#L23)
1. [PlayerProps.onPlayerApiChange](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/components/Player.tsx#L9)
1. [PlayerApi.loadVideo](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/players/PlayerApi.ts#L25)
1. [PlayerApi.play](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/players/PlayerApi.ts#L26)
1. [PlayerOptions.onPlay](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/players/PlayerApi.ts#L16)
1. [PlayerOptions.onTimeUpdate](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/players/PlayerApi.ts#L19)
1. [PlayerApi.pause](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/players/PlayerApi.ts#L27)
1. [PlayerOptions.onPause](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/players/PlayerApi.ts#L17)
1. [PlayerOptions.onEnded](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/players/PlayerApi.ts#L18)
1. [PlayerApi.detach](https://github.com/VocaDB/nostalgic-diva/blob/2cb564805bd1e0c9a1ce6b2e0a0e0300c8442f27/src/players/PlayerApi.ts#L24)

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
