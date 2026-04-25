'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ReviewModal } from './ReviewModal';

export const ReviewChecker = () => {
  const [pendingReview, setPendingReview] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkPending = () => {
      // 1. Detect role (Prioritize tab-local sessionStorage for multi-tab testing)
      let role: 'driver' | 'passenger' = 'passenger';
      const sessionRole = sessionStorage.getItem('tab-role') as any;
      
      if (sessionRole === 'driver' || sessionRole === 'passenger') {
        role = sessionRole;
      } else if (pathname.includes('/driver')) {
        role = 'driver';
      } else if (pathname.includes('/passenger')) {
        role = 'passenger';
      } else {
        // Fallback for role-less pages (e.g. Profile)
        // We still want to check if there's any pending review in storage 
        // using the last known role or checking both.
        role = localStorage.getItem('app-role') as any || 'passenger';
      }

      // 2. Check for role-specific review
      const reviewKey = `pending-review-${role}`;
      const saved = localStorage.getItem(reviewKey);
      
      // 3. Fallback/Cleanup: Check for legacy key without suffix
      const legacySaved = localStorage.getItem('pending-review');
      
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setPendingReview({ ...data, storageKey: reviewKey });
        } catch (e) {
          localStorage.removeItem(reviewKey);
        }
      } else if (legacySaved) {
        // Handle legacy data to prevent "stuck" reviews
        try {
          const data = JSON.parse(legacySaved);
          // Only show if the target role matches our current role's expectation
          // (e.g. if I am a passenger, I rate a driver)
          if ((role === 'passenger' && data.targetRole === 'driver') || 
              (role === 'driver' && data.targetRole === 'passenger')) {
            setPendingReview({ ...data, storageKey: 'pending-review' });
          } else {
            // Wrong role/tab for this legacy review, ignore it for now or clear it
            localStorage.removeItem('pending-review');
          }
        } catch (e) {
          localStorage.removeItem('pending-review');
        }
      }
      
      // 4. Orphaned Ride Recovery (Handling rides that ended while offline)
      const activeRideId = localStorage.getItem('active-ride-id');
      if (activeRideId && !saved && !legacySaved) {
        try {
          const history = JSON.parse(localStorage.getItem('ride-history') || '[]');
          const finishedRide = history.find((h: any) => h.id === activeRideId);
          
          if (finishedRide) {
            console.log('ReviewChecker: Recovered finished ride from history', activeRideId);
            
            // 3. Create the review record for the current role
            const recoveredReview = {
              rideId: activeRideId,
              targetName: role === 'passenger' ? (finishedRide.driverName || 'Водитель') : (finishedRide.passengerName || 'Пассажир'),
              targetRole: role === 'passenger' ? 'driver' : 'passenger',
              targetPhotoId: role === 'passenger' ? (finishedRide.driverAvatarId || 'avatar1') : (finishedRide.passengerAvatarId || 'avatar1'),
              targetRating: role === 'passenger' ? (finishedRide.driverRating || '5.0') : (finishedRide.passengerRating || '5.0'),
              targetReviewCount: role === 'passenger' ? Math.floor(Number(finishedRide.driverTripCount || 10) * 0.8) : Math.floor(Number(finishedRide.passengerTripCount || 5) * 0.8),
              targetTripCount: role === 'passenger' ? (finishedRide.driverTripCount || '0') : (finishedRide.passengerTripCount || '0'),
              carInfo: role === 'passenger' ? {
                brand: finishedRide.carBrand || '',
                model: finishedRide.carModel || '',
                color: finishedRide.carColor || '',
                plate: finishedRide.carPlate || ''
              } : undefined,
              finishedAt: finishedRide.finishedAt,
              timestamp: Date.now(),
              storageKey: `pending-review-${role}`
            };
            
            localStorage.setItem(`pending-review-${role}`, JSON.stringify(recoveredReview));
            localStorage.removeItem('active-ride-id');
            localStorage.removeItem('active-ride-data');
            
            // Force re-run to show the modal immediately
            setPendingReview(recoveredReview);
            
            // Notify other components (GlobalButton)
            window.dispatchEvent(new Event('storage'));
            return;
          }
        } catch (e) {
          console.warn('ReviewChecker: Recovery failed', e);
        }
      }

      if (saved || legacySaved) return;

      if (!activeRideId) {
        setPendingReview(null);
      }
    };

    checkPending();
    window.addEventListener('storage', checkPending);
    const interval = setInterval(checkPending, 2000);

    return () => {
      window.removeEventListener('storage', checkPending);
      clearInterval(interval);
    };
  }, [pathname]);

  const handleClose = () => {
    if (pendingReview?.storageKey) {
      localStorage.removeItem(pendingReview.storageKey);
    }
    setPendingReview(null);
  };

  const handleSubmit = (rating: number) => {
    console.log(`Submitted rating ${rating} for trip ${pendingReview?.rideId}`);
    if (pendingReview?.storageKey) {
      localStorage.removeItem(pendingReview.storageKey);
    }
    setPendingReview(null);
  };

  if (!pendingReview) return null;

  return (
    <ReviewModal
      targetName={pendingReview.targetName}
      targetRole={pendingReview.targetRole}
      targetPhotoId={pendingReview.targetPhotoId}
      targetRating={pendingReview.targetRating}
      targetReviewCount={pendingReview.targetReviewCount}
      targetTripCount={pendingReview.targetTripCount}
      carInfo={pendingReview.carInfo}
      finishedAt={pendingReview.finishedAt}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  );
};
