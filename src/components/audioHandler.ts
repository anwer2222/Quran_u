/**
 * Safely handles seeking and playing MP3 segments without timestamp drifting.
 */
export async function playAudioSegment(
    audioEl: HTMLAudioElement,
    targetSrc: string,
    startTime: number
  ): Promise<void> {
    // 1. Pause immediately to stop media clock jitter
    audioEl.pause();
  
    const cleanCurrentSrc = audioEl.src.replace(/^https?:\/\/[^\/]+/, "");
    const isNewTrack = !cleanCurrentSrc.endsWith(targetSrc);
  
    if (isNewTrack) {
      audioEl.src = targetSrc;
      audioEl.load();
  
      // Wait until audio metadata is fully loaded
      await new Promise<void>((resolve) => {
        const handleLoaded = () => {
          audioEl.removeEventListener("loadedmetadata", handleLoaded);
          resolve();
        };
        audioEl.addEventListener("loadedmetadata", handleLoaded);
      });
    }
  
    // 2. Set currentTime only when ready
    if (!isNaN(startTime) && startTime >= 0) {
      audioEl.currentTime = startTime;
    }
  
    // 3. Small micro-task tick to allow browser decoder buffer to settle
    await new Promise((r) => setTimeout(r, 50));
  
    try {
      await audioEl.play();
    } catch (err) {
      console.warn("Autoplay interaction prevented:", err);
    }
  }