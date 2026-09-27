'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import BookingSheet from './BookingSheet';
import { DEFAULT_SCOOTER } from '@/lib/landing/content';

const BookingContext = createContext({ scooter: DEFAULT_SCOOTER, openSheet: () => {} });

/** Motor yang sedang dipilih (cek harga & formulir booking memakainya). */
export function useBooking() {
  return useContext(BookingContext);
}

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [scooter, setScooter] = useState(DEFAULT_SCOOTER);
  const triggerRef = useRef(null);

  const openSheet = useCallback((trigger, chosen) => {
    triggerRef.current = trigger ?? null;
    if (chosen) setScooter(chosen);
    // Setiap kali dibuka, mulai lagi dari langkah 1.
    setStep(1);
    setOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus?.({ preventScroll: true });
  }, []);

  const value = useMemo(() => ({ scooter, openSheet }), [scooter, openSheet]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingSheet open={open} step={step} scooter={scooter} onStepChange={setStep} onClose={closeSheet} />
    </BookingContext.Provider>
  );
}

/**
 * Tombol yang di referensi berupa <a href="#"> dan membuka formulir booking.
 * Tetap <a> supaya tampilannya identik dengan elemen aslinya. `scooter`
 * (opsional) = motor yang dipilih dari kartu armada ("Book this").
 */
export function BookingLink({ className, scooter, children }) {
  const { openSheet } = useBooking();
  return (
    <a
      href="#booking"
      aria-haspopup="dialog"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        openSheet(e.currentTarget, scooter);
      }}
    >
      {children}
    </a>
  );
}
