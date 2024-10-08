import React, { useRef, useEffect } from 'react';
import { StyleSheet, requireNativeComponent, NativeModules, Platform, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

const IJKPlayerModule = NativeModules.RNByronVlcModule || {};

const IJKPlayer = (props) => {
  const _root = useRef(null);
  const timer = useRef(null);
   
  //Set native properties on native component
  const setNativeProps = (nativeProps) => {
    _root.current?.setNativeProps(nativeProps);
  };
  //Seek a specific time in the video
  const seek = (time, pauseAfterSeek) => {
    IJKPlayerModule.seek?.(time, pauseAfterSeek);
  };
  //Set volume
  const setVolume = (volume) => {
    setNativeProps({ volume });
  };
  // Pause or play
  const setPaused = (paused) => {
    setNativeProps({ paused });
  };
  //Mute or unmute
  const setMute = (mute) => {
    setNativeProps({ mute });
  };
  // Take a snapshot of the current frame
  const takeSnapshot = async (path) => {
    return await IJKPlayerModule.takeSnapshot?.(path);
  };
  // Adjust audio
  const setPan = (pan) => {
    const l = pan < 0 ? 1 : 1 - pan;
    const r = pan < 0 ? 1 + pan : 1;
    IJKPlayerModule.setPan?.(l, r);
  };
  // Set Path
  const snapshot = (snapshotPath) => {
    setNativeProps({ snapshotPath });
  };
  //Set equalizer preset
  const setEQPreset = (preset) => {
    IJKPlayerModule.setEQPreset?.(preset);
  };
  // Selecting text by index
  const setTextTrackIndex = (index) => {
    setNativeProps({ selectedTextTrack: index });
  };
  // Select audio by index
  const setAudioTrackIndex = (index) => {
    IJKPlayerModule.getSelectedTracks?.();
    setNativeProps({ selectedAudioTrack: index });
  };
  // Deselect track by index
  const deselectTrack = (index) => {
    setNativeProps({ deselectTrack: index });
  };

  // Event for when a video starts loading in
  const onLoadStart = (event) => {
    props.onLoadStart?.(event.nativeEvent);

    if (Platform.OS === 'ios') {
      timer.current = setTimeout(() => {
        props.onError?.();
        setNativeProps({ paused: true });
        timer.current = null;
      }, props.timeout || 30000);
    }
  };
  // Handler for when a video had loading in
  const onLoad = (event) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    IJKPlayerModule.init?.();
    props.onLoad?.(event.nativeEvent);
  };
  //Handler for errors
  const onError = (event) => {
    props.onError?.(event.nativeEvent);
  };
  //Handler for video progress
  const onProgress = (event) => {
    props.onProgress?.(event.nativeEvent);

    if (Platform.OS === 'ios') {
      const { duration, currentTime } = event.nativeEvent;
      if (duration - currentTime < 250) {
        setNativeProps({ paused: true });
        props.onEnd?.(event.nativeEvent);
      }
    }
  };
  //Event handler for pause
  const onPause = (event) => {
    props.onPause?.(event.nativeEvent);
  };
  //Event handler for Stop
  const onStop = (event) => {
    props.onStop?.(event.nativeEvent);
  };
  // Event handler for ending the video
  const onEnd = (event) => {
    props.onEnd?.(event.nativeEvent);
  };
  // Event handling for buffering
  const onBuffer = (event) => {
    props.onBuffer?.(event.nativeEvent);
  };
  // Event handler for subtitles
  const onTimedText = (event) => {
    props.onTimedText?.(event.nativeEvent);
  };
  // Event handler for play
  const onPlay = () => {
    props.onPlay?.();
  };
  // Cleanup 
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, []);


  const source = resolveAssetSource(props.source) || {};
  const headers = source.headers || {};
  const userAgent = source.userAgent || '';
  const options = [...(source.options || []), '--input-repeat=1000'];
  let uri = source.uri || '';
  if (uri && uri.match(/^\//)) {
    uri = `file://${uri}`;
  }
  // Preparing native props
  const nativeProps = {
    ...props,
    style: [styles.base, props.style],
    src: { uri, headers, userAgent, options },
    onVideoLoadStart: onLoadStart,
    onVideoLoad: onLoad,
    onVideoError: onError,
    onVideoProgress: onProgress,
    onVideoPause: onPause,
    onVideoStop: onStop,
    onVideoEnd: onEnd,
    onVideoBuffer: onBuffer,
    onTimedText: onTimedText,
    onPlay: onPlay,
  };

  return <RNByronVlc ref={_root} {...nativeProps} />;
};
IJKPlayer.propTypes = {
  /* Native only */
  src: PropTypes.object,
  seek: PropTypes.number,
  snapshotPath: PropTypes.string,
  onVideoLoadStart: PropTypes.func,
  onVideoLoad: PropTypes.func,
  onVideoBuffer: PropTypes.func,
  onVideoError: PropTypes.func,
  onVideoProgress: PropTypes.func,
  onVideoPause: PropTypes.func,
  onVideoStop: PropTypes.func,
  onVideoEnd: PropTypes.func,

  /* Wrapper component */
  source: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
      headers: PropTypes.object,
      userAgent: PropTypes.string,
      options: PropTypes.array,
    }),
    PropTypes.number, // For require('./video.mp4')
  ]),
  muted: PropTypes.bool,
  volume: PropTypes.number,
  onLoadStart: PropTypes.func,
  onLoad: PropTypes.func,
  onBuffer: PropTypes.func,
  onError: PropTypes.func,
  onProgress: PropTypes.func,
  onPause: PropTypes.func,
  onStop: PropTypes.func,
  onEnd: PropTypes.func,
  onPlay: PropTypes.func,
  onTimedText: PropTypes.func,
  timeout: PropTypes.number,

  /* Required by react-native */
  scaleX: PropTypes.number,
  scaleY: PropTypes.number,
  translateX: PropTypes.number,
  translateY: PropTypes.number,
  rotation: PropTypes.number,
  ...ViewPropTypes,
};

const RNByronVlc = requireNativeComponent("RNByronVlc", IJKPlayer, {
  nativeOnly: {
    src: true,
    seek: true,
    snapshotPath: true,
  },
});

export default IJKPlayer;