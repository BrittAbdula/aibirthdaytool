// hooks/useCardGeneration.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useSession, signIn } from 'next-auth/react';

interface CardGenerationOptions {
  cardType: string;
  size: string;
  modelId: string;
  formData: Record<string, any>;
  modificationFeedback?: string;
  previousCardId?: string;
  imageCount: number;
}

interface ImageState {
  url: string;
  id: string;
  svgContent: string;
  isLoading: boolean;
  progress: number;
  error: string | null;
  animationTimer?: NodeJS.Timeout; // Store timer ID here
}

export const useCardGeneration = () => {
  const { data: session } = useSession();
  const [imageStates, setImageStates] = useState<ImageState[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const pendingAuthRef = useRef<boolean>(false);
  const [savedAuthData, setSavedAuthData] = useState<CardGenerationOptions | null>(null);

  const imageRefs = useRef<Array<HTMLDivElement | null>>([]); // Pass this ref from parent

  // Function to initialize image states with default values
  const initializeImageStates = useCallback((count: number, defaultUrl: string) => {
    if (imageStates.length > 0) return; // Don't re-initialize if states already exist
    
    const initialStates: ImageState[] = Array.from({ length: count }).map(() => ({
      url: defaultUrl,
      id: '',
      svgContent: '',
      isLoading: false,
      progress: 0,
      error: null
    }));
    
    setImageStates(initialStates);
  }, [imageStates.length]);

  const triggerConfettiForImage = useCallback((index: number) => {
    const imageRef = imageRefs.current[index];
    if (imageRef) {
      const rect = imageRef.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { x, y: y - 0.1 },
        zIndex: 9999
      });
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      setImageStates(prevStates => {
        prevStates.forEach(state => {
          if (state.animationTimer) {
            clearInterval(state.animationTimer);
          }
        });
        return [];
      });
    };
  }, []);

  const generateCards = useCallback(async (options: CardGenerationOptions) => {
    const { imageCount, cardType, size, modelId, formData, modificationFeedback, previousCardId } = options;

    if (!session) {
      setSavedAuthData(options);
      pendingAuthRef.current = true;
      setShowAuthDialog(true);
      return { success: false, error: 'auth' }; 
    }

    setError(null);
    setGlobalLoading(true);
    
    // Initialize states with animation timer
    const initialImageStates: ImageState[] = Array.from({ length: imageCount }).map((_, index) => {
      const animationIntervalId = setInterval(() => {
        setImageStates(prev => {
          const newStates = [...prev];
          const currentState = newStates[index];

          if (!currentState || !currentState.isLoading || currentState.progress >= 95) { // Stop animation near completion or if not loading
            if (currentState && currentState.animationTimer) clearInterval(currentState.animationTimer);
            return prev;
          }
          
          // Dynamic progress update
          const currentProgress = currentState.progress;
          let progressIncrement = 0.5;
          if (currentProgress < 30) progressIncrement = 3;
          else if (currentProgress < 50) progressIncrement = 2;
          
          newStates[index] = { ...currentState, progress: Math.min(95, currentProgress + progressIncrement) }; // Cap animation progress
          return newStates;
        });
      }, 800);

      return {
        url: '',
        id: '',
        svgContent: '',
        isLoading: true,
        progress: 10, // Start at 10%
        error: null,
        animationTimer: animationIntervalId, // Store timer ID
      };
    });
    
    setImageStates(initialImageStates);

    try {
      const generatePromises = initialImageStates.map(async (initialState, index) => {
        const payload: Record<string, any> = {
          cardType, size, modelId, ...formData, variationIndex: index
        };
        if (modificationFeedback) {
          payload.modificationFeedback = modificationFeedback;
          payload.previousCardId = previousCardId; // Ensure previousCardId is passed
        }

        try {
          const response = await fetch('/api/generate-card', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          });

          if (!response.ok) {
            if (response.status === 429) { setShowLimitDialog(true); throw new Error('rate_limit'); }
            if (response.status === 401) { throw new Error('auth'); }
            throw new Error('Failed to start card generation');
          }

          const { cardId } = await response.json();
          let isCompleted = false;
          const startPollingTime = Date.now();
          const maxPollingDuration = 180000; // 180 seconds max

          // Update the state with the generated cardId
          setImageStates(prev => {
            const newStates = [...prev];
            if (newStates[index]) {
              newStates[index].id = cardId; // Set cardId
              newStates[index].progress = 20; // Move to initial polling progress
            }
            return newStates;
          });

          while (Date.now() - startPollingTime < maxPollingDuration && !isCompleted) {
            const pollingDelay = Date.now() - startPollingTime < 10000 ? 1000 : 2000;
            await new Promise(resolve => setTimeout(resolve, pollingDelay));
            if (isCompleted) break; // Check again after delay

            const statusResponse = await fetch(`/api/card-status?cardId=${cardId}`);
            if (!statusResponse.ok) {
              console.error(`Failed to check status for ${cardId}, retrying...`);
              setImageStates(prev => {
                const newStates = [...prev];
                if (newStates[index]) {
                  newStates[index].error = 'Temporary connection issue, retrying...';
                }
                return newStates;
              });
              continue; // Continue polling on status check failure
            }

            const statusData = await statusResponse.json();
            
            // Update progress and state based on status
            setImageStates(prev => {
              const newStates = [...prev];
              const currentState = newStates[index];
              if (!currentState) return prev; // Should not happen

              let newProgress = currentState.progress;
              let newIsLoading = true;
              let newError = null;
              let newUrl = currentState.url;
              let newSvgContent = currentState.svgContent;

              switch (statusData.status) {
                case 'pending': newProgress = Math.max(currentState.progress, 30); break;
                case 'processing': newProgress = Math.max(currentState.progress, 50); break;
                case 'completed': 
                  newProgress = 100; 
                  newIsLoading = false; 
                  isCompleted = true; 
                  newUrl = statusData.r2Url || (statusData.responseContent ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(statusData.responseContent)}` : currentState.url);
                  newSvgContent = statusData.responseContent || currentState.svgContent;
                  break;
                case 'failed': 
                  newProgress = 0; 
                  newIsLoading = false; 
                  newError = statusData.errorMessage || 'Generation failed'; 
                  isCompleted = true; 
                  break;
              }

              // Clear the animation timer if completed or failed
              if (isCompleted && currentState.animationTimer) {
                clearInterval(currentState.animationTimer);
                newStates[index].animationTimer = undefined; // Remove timer reference
              }

              newStates[index] = { 
                ...currentState, 
                progress: newProgress, 
                isLoading: newIsLoading, 
                error: newError,
                url: newUrl, 
                svgContent: newSvgContent,
              };
              
              return newStates;
            });

            // If completed or failed, exit polling loop for this image
            if (isCompleted) break;
          }

          // If loop finished and not completed, it's a timeout
          if (!isCompleted) {
            setImageStates(prev => {
              const newStates = [...prev];
              const currentState = newStates[index];
              if (!currentState) return prev;
              // Clear timer on timeout
              if (currentState.animationTimer) clearInterval(currentState.animationTimer);
              newStates[index] = { ...currentState, isLoading: false, progress: currentState.progress, error: currentState.error || 'Generation timed out', animationTimer: undefined };
              return newStates;
            });
            throw new Error('Card generation timed out for image ' + (index + 1));
          }

          // If completed, trigger confetti and return success
          if (isCompleted) {
            setTimeout(() => triggerConfettiForImage(index), 200);
            return { success: true, index };
          }
          // Should not reach here if logic is correct, but as fallback:
          return { success: false, error: 'Unexpected polling exit', index };

        } catch (innerError: any) {
          // Clean up timer and update state on error during initial fetch or polling loop itself
          setImageStates(prev => {
            const newStates = [...prev];
            const currentState = newStates[index];
            if (currentState && currentState.animationTimer) clearInterval(currentState.animationTimer);
            // Update state with error
            newStates[index] = { ...newStates[index], isLoading: false, progress: newStates[index]?.progress || 0, error: innerError.message, animationTimer: undefined };
            return newStates;
          });
          // Return as failure result for Promise.all
          return { success: false, error: innerError.message, index };
        }
      });

      // Wait for all image generation promises to settle
      const results = await Promise.all(generatePromises);
      
      // Check overall results and update global error/feedback
      const failedResults = results.filter(result => result && !result.success);
      if (failedResults.length > 0) {
        // Handle specific errors like auth or rate limit first
        const authError = failedResults.find(r => r.error === 'auth');
        if(authError) throw new Error('auth'); // Re-throw to trigger auth dialog

        const rateLimitError = failedResults.find(r => r.error === 'rate_limit');
        if(rateLimitError) { setShowLimitDialog(true); throw new Error('rate_limit'); } // Re-throw to trigger limit dialog

        // Collect other errors
        const otherErrors = failedResults
          .filter(r => r.error !== 'auth' && r.error !== 'rate_limit')
          .map(r => r.error);

        if (otherErrors.length > 0) {
          // Only set global error if not already set by individual image timeouts or other issues
          setError(prev => prev || 'Some cards failed to generate: ' + otherErrors.join(', '));
        } else if (failedResults.length > 0) { // Generic failure if no specific error messages
          setError(prev => prev || 'One or more cards failed to generate. Please try again.');
        }
      } else { // All successful
        // Show feedback mode after first successful batch generation
        // Check if at least one card was generated successfully before showing feedback mode
        const anySuccessful = results.some(result => result && result.success);
        // You might want to add logic here to handle feedback mode if it applies per batch
        // For now, leaving the feedback mode logic in CardGenerator component as it was
      }

      return { success: failedResults.length === 0, results }; // Return results for parent to inspect if needed

    } catch (outerError: any) {
      // Handle top-level errors (auth, rate_limit re-thrown)
      if (outerError.message === 'auth') { /* Handled by re-throwing */ return { success: false, error: 'auth' }; }
      if (outerError.message === 'rate_limit') { /* Handled by re-throwing */ return { success: false, error: 'rate_limit' }; }

      setError(outerError.message || 'An unexpected error occurred.');
      return { success: false, error: outerError.message };

    } finally {
      // Global loading is false when all promises in Promise.all have settled
      setGlobalLoading(false);
      // Individual timers are cleared within each promise now or by useEffect on unmount
    }
  }, [session, triggerConfettiForImage, imageRefs, setShowAuthDialog, setShowLimitDialog, savedAuthData]); // Added dependencies

  // Effect to handle post-auth generation
  useEffect(() => {
    if (pendingAuthRef.current && session && savedAuthData) {
      pendingAuthRef.current = false;
      setShowAuthDialog(false);
      // Small delay to ensure session is fully loaded and state settled
      const optionsToGenerate = savedAuthData; // Copy data before clearing
      setSavedAuthData(null); // Clear saved data immediately
      setTimeout(() => {
        generateCards(optionsToGenerate);
      }, 500);
    }
  }, [session, savedAuthData, generateCards, setShowAuthDialog]); // Added dependencies

  // Also need to handle cleanup if component unmounts while loading - done in initial useEffect

  return {
    generateCards,
    imageStates,
    globalLoading,
    error,
    showAuthDialog,
    setShowAuthDialog,
    showLimitDialog,
    setShowLimitDialog,
    imageRefs, // Return ref to attach in parent
    initializeImageStates, // Add initialization function
  };
};