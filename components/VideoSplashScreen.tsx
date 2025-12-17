
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

interface VideoSplashScreenProps {
  videoSource: string | number;
  onFinish: () => void;
  minDuration?: number;
}

export default function VideoSplashScreen({ 
  videoSource, 
  onFinish, 
  minDuration = 2000 
}: VideoSplashScreenProps) {
  const [startTime] = useState(Date.now());
  const [videoEnded, setVideoEnded] = useState(false);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = true;
    player.play();
  });

  // Listen to status changes to detect when video ends
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  // Listen to playing state changes
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    console.log('VideoSplashScreen mounted');
    
    // Hide the native splash screen when component mounts
    const hideNativeSplash = async () => {
      try {
        await SplashScreen.hideAsync();
        console.log('Native splash screen hidden');
      } catch (error) {
        console.log('Error hiding splash screen:', error);
      }
    };

    hideNativeSplash();
  }, []);

  // Detect when video ends (when it stops playing and we're at the end)
  useEffect(() => {
    if (!isPlaying && player.currentTime >= player.duration - 0.1 && player.duration > 0) {
      console.log('Video playback ended');
      setVideoEnded(true);
    }
  }, [isPlaying, player.currentTime, player.duration]);

  // Handle finishing the splash screen
  useEffect(() => {
    if (videoEnded) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      console.log(`Video ended. Elapsed: ${elapsed}ms, Remaining: ${remaining}ms`);

      setTimeout(() => {
        console.log('Finishing splash screen');
        onFinish();
      }, remaining);
    }
  }, [videoEnded, startTime, minDuration, onFinish]);

  const handleFirstFrameRender = () => {
    console.log('First frame rendered');
  };

  const handleError = (error: any) => {
    console.error('Video error:', error);
    // If video fails to load, finish splash screen after min duration
    setTimeout(() => {
      console.log('Video error - finishing splash screen');
      onFinish();
    }, minDuration);
  };

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        onFirstFrameRender={handleFirstFrameRender}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
});
